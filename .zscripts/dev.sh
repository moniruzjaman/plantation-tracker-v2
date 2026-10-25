#!/bin/bash

set -euo pipefail

# স্ক্রিপ্ট এবং প্রজেক্টের রুট ডিরেক্টরি বের করা
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# সকল ব্যাকগ্রাউন্ড প্রসেসের PID সংরক্ষণের অ্যারে
MINI_PIDS=()
DEV_PID=""

log_step_start() {
	local step_name="$1"
	echo "=========================================="
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] শুরু হচ্ছে: $step_name"
	echo "=========================================="
	STEP_START_TIME=$(date +%s)
}

log_step_end() {
	local step_name="${1:-Unknown step}"
	local end_time
	end_time=$(date +%s)
	local duration=$((end_time - STEP_START_TIME))
	echo "=========================================="
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] সম্পন্ন হয়েছে: $step_name"
	echo "[LOG] স্টেপ: $step_name | সময় লেগেছে: ${duration}s"
	echo "=========================================="
	echo ""
}

start_mini_services() {
	local mini_services_dir="$PROJECT_DIR/mini-services"
	local log_dir="$PROJECT_DIR/.zscripts"
	local started_count=0

	log_step_start "Mini-services চালু করা"
	if [ ! -d "$mini_services_dir" ]; then
		echo "Mini-services ডিরেক্টরি পাওয়া যায়নি, স্কিপ করা হচ্ছে..."
		log_step_end "Mini-services চালু করা"
		return 0
	fi

	# লগ ডিরেক্টরি বিদ্যমান থাকা নিশ্চিত করা
	mkdir -p "$log_dir"

	echo "Mini-services ডিরেক্টরি পাওয়া গেছে, সাব-সার্ভিস স্ক্যান করা হচ্ছে..."

	for service_dir in "$mini_services_dir"/*; do
		if [ ! -d "$service_dir" ]; then
			continue
		fi

		local service_name
		service_name=$(basename "$service_dir")
		echo "সার্ভিস চেক করা হচ্ছে: $service_name"

		if [ ! -f "$service_dir/package.json" ]; then
			echo "[$service_name] কোনো package.json পাওয়া যায়নি, স্কিপ করা হচ্ছে..."
			continue
		fi

		# dev স্ক্রিপ্ট নিখুঁতভাবে চেক করার জন্য Regex (devDependencies ভুলভাবে ধরা এড়াতে)
		if ! grep -E -q '"dev"\s*:' "$service_dir/package.json"; then
			echo "[$service_name] কোনো dev স্ক্রিপ্ট পাওয়া যায়নি, স্কিপ করা হচ্ছে..."
			continue
		fi

		echo "[$service_name] ব্যাকগ্রাউন্ডে চালু করা হচ্ছে..."
		(
			cd "$service_dir"
			echo "[$service_name] ডিপেন্ডেন্সি ইনস্টল করা হচ্ছে..."
			bun install
			echo "[$service_name] bun run dev চালানো হচ্ছে..."
			exec bun run dev
		) >"$log_dir/mini-service-${service_name}.log" 2>&1 &

		local service_pid=$!
		MINI_PIDS+=("$service_pid")
		echo "[$service_name] ব্যাকগ্রাউন্ডে চালু হয়েছে (PID: $service_pid)"
		echo "[$service_name] লগ ফাইল: $log_dir/mini-service-${service_name}.log"
		started_count=$((started_count + 1))
	done

	echo "Mini-services চালুকরণ সম্পন্ন। মোট $started_count টি সার্ভিস চালু হয়েছে।"
	log_step_end "Mini-services চালু করা"
}

wait_for_service() {
	local host="$1"
	local port="$2"
	local service_name="$3"
	local max_attempts="${4:-60}"
	local attempt=1

	echo "$service_name প্রস্তুত হওয়ার জন্য $host:$port এ অপেক্ষা করা হচ্ছে..."

	while [ "$attempt" -le "$max_attempts" ]; do
		if curl -s --connect-timeout 2 --max-time 5 "http://$host:$port" >/dev/null 2>&1; then
			echo "$service_name তৈরি হয়ে গেছে!"
			return 0
		fi

		echo "চেষ্টা $attempt/$max_attempts: $service_name এখনও প্রস্তুত নয়, অপেক্ষা করা হচ্ছে..."
		sleep 1
		attempt=$((attempt + 1))
	done

	echo "ERROR: $service_name $max_attempts সেকেন্ডের মধ্যে চালু হতে ব্যর্থ হয়েছে"
	return 1
}

cleanup() {
	# ট্র্যাপ লুপ বা বারবার ট্রিগার হওয়া বন্ধ করা
	trap - EXIT INT TERM
	echo ""
	echo "🛑 কোনো ত্রুটি ঘটেছে বা ইন্টারাপ্ট সিগন্যাল পাওয়া গেছে, ব্যাকগ্রাউন্ড প্রসেস বন্ধ করা হচ্ছে..."

	if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" >/dev/null 2>&1; then
		echo "Next.js dev server বন্ধ করা হচ্ছে (PID: $DEV_PID)..."
		kill "$DEV_PID" >/dev/null 2>&1 || true
	fi

	for pid in "${MINI_PIDS[@]:-}"; do
		if [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1; then
			echo "Mini-service বন্ধ করা হচ্ছে (PID: $pid)..."
			kill "$pid" >/dev/null 2>&1 || true
		fi
	done
}

trap cleanup EXIT INT TERM

cd "$PROJECT_DIR"

if ! command -v bun >/dev/null 2>&1; then
	echo "ERROR: bun ইনস্টল করা নেই অথবা PATH-এ পাওয়া যাচ্ছে না"
	exit 1
fi

log_step_start "bun install"
echo "[BUN] ডিপেন্ডেন্সি ইনস্টল করা হচ্ছে..."
bun install
log_step_end "bun install"

log_step_start "bun run db:push"
echo "[BUN] ডাটাবেস সেটআপ করা হচ্ছে..."
bun run db:push
log_step_end "bun run db:push"

log_step_start "Next.js dev server চালু করা"
echo "[BUN] ডেভেলপমেন্ট সার্ভার চালু করা হচ্ছে..."
bun run dev &
DEV_PID=$!
log_step_end "Next.js dev server চালু করা"

log_step_start "Next.js dev server এর জন্য অপেক্ষা"
wait_for_service "localhost" "3000" "Next.js dev server"
log_step_end "Next.js dev server এর জন্য অপেক্ষা"

log_step_start "Health check"
echo "[BUN] হেলথ চেক করা হচ্ছে..."
curl -fsS localhost:3000 >/dev/null
echo "[BUN] হেলথ চেক সফল হয়েছে"
log_step_end "Health check"

start_mini_services

echo "🎉 Next.js dev server (PID: $DEV_PID) এবং Mini-services সফলভাবে ব্যাকগ্রাউন্ডে চলছে।"

# প্রসেস ডিসওন (disown) করা যাতে স্ক্রিপ্ট শেষ হলেও ব্যাকগ্রাউন্ড সার্ভিসগুলো চলতে থাকে
disown "$DEV_PID" 2>/dev/null || true
for pid in "${MINI_PIDS[@]:-}"; do
	disown "$pid" 2>/dev/null || true
done

# সফলভাবে কাজ শেষ হলে ট্র্যাপ নিষ্ক্রিয় করা যাতে সার্ভিসগুলো বন্ধ না হয়
trap - EXIT INT TERM
