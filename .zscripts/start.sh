#!/bin/sh

set -e

# স্ক্রিপ্টটি যে ডিরেক্টরিতে আছে তা বের করা
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR"

# সকল সাব-প্রসেসের (Sub-process) PID সংরক্ষণের ভেরিয়াবল
pids=""

# ক্লিনআপ ফাংশন: সফলভাবে সমস্ত সার্ভিস বন্ধ করা
cleanup() {
    # পুনঃবার ট্র্যাপ ট্রিগার হওয়া বন্ধ করা
    trap - EXIT INT TERM
    
    echo ""
    echo "🛑 সমস্ত সার্ভিস বন্ধ করা হচ্ছে..."
    
    # সকল সাব-প্রসেসে SIGTERM সিগন্যাল পাঠানো হচ্ছে
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            service_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "অজানা")
            echo "   প্রসেস বন্ধ করা হচ্ছে: $pid ($service_name)..."
            kill -TERM "$pid" 2>/dev/null
        fi
    done
    
    # সমস্ত প্রসেস বন্ধ হওয়া পর্যন্ত অপেক্ষা (সর্বোচ্চ ৫ সেকেন্ড)
    sleep 1
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            timeout=4
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done
            if kill -0 "$pid" 2>/dev/null; then
                echo "   প্রসেস $pid জোরপূর্বক বন্ধ করা হচ্ছে..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done
    
    echo "✅ সমস্ত সার্ভিস সফলভাবে বন্ধ করা হয়েছে"
    exit 0
}

# স্ক্রিপ্ট বন্ধ বা ইন্টারাপ্ট (Ctrl+C/SIGTERM) হলে ক্লিনআপ ফাংশন ট্রিগার করা
trap cleanup EXIT INT TERM

echo "🚀 সকল সার্ভিস চালু করা হচ্ছে..."
echo ""

# বিল্ড ডিরেক্টরিতে নেভিগেট করা
cd "$BUILD_DIR" || exit 1

ls -lah

DEFAULT_PACKAGED_DB_PATH="./db/custom.db"
[ -f "/app/db/custom.db" ] && DEFAULT_PACKAGED_DB_PATH="/app/db/custom.db"
DEFAULT_PACKAGED_DATABASE_URL="file:$DEFAULT_PACKAGED_DB_PATH"

# Next.js সার্ভার চালু করা
if [ -f "./next-service-dist/server.js" ]; then
    echo "🚀 Next.js সার্ভার চালু করা হচ্ছে..."
    cd next-service-dist/ || exit 1
    
    # এনভায়রনমেন্ট ভেরিয়েবল সেট করা
    export NODE_ENV=production
    export PORT="${PORT:-3000}"
    export HOSTNAME="${HOSTNAME:-0.0.0.0}"
    export DATABASE_URL="${DATABASE_URL:-$DEFAULT_PACKAGED_DATABASE_URL}"

    if [ "$DATABASE_URL" = "$DEFAULT_PACKAGED_DATABASE_URL" ]; then
        if [ ! -f "$DEFAULT_PACKAGED_DB_PATH" ]; then
            echo "❌ প্যাকেজ করা ডাটাবেস ফাইলটি পাওয়া যায়নি: $DEFAULT_PACKAGED_DB_PATH"
            echo "   প্রডাকশন এনভায়রনমেন্ট খালি ডাটাবেসে শুরু হওয়া এড়াতে প্রসেস বাতিল করা হলো।"
            exit 1
        fi

        echo "🗄️  বর্তমানে প্যাকেজ করা ডাটাবেস ব্যবহৃত হচ্ছে: $DEFAULT_PACKAGED_DB_PATH"
    else
        echo "🗄️  বর্তমানে বাহ্যিক নির্দিষ্ট ডাটাবেস ব্যবহৃত হচ্ছে: $DATABASE_URL"
    fi
    
    # ব্যাকগ্রাউন্ডে Next.js চালানো
    bun server.js &
    NEXT_PID=$!
    pids="$NEXT_PID"
    
    # প্রসেসটি সফলভাবে চালু হয়েছে কিনা তা পরীক্ষা করা
    sleep 1
    if ! kill -0 "$NEXT_PID" 2>/dev/null; then
        echo "❌ Next.js সার্ভার চালুকরণ ব্যর্থ হয়েছে"
        exit 1
    else
        echo "✅ Next.js সার্ভার চালু হয়েছে (PID: $NEXT_PID, Port: $PORT)"
    fi
    
    cd ../
else
    echo "⚠️  Next.js সার্ভার ফাইলটি পাওয়া যায়নি: ./next-service-dist/server.js"
fi

# mini-services চালু করা
if [ -f "./mini-services-start.sh" ]; then
    echo "🚀 mini-services চালু করা হচ্ছে..."
    
    # রুট ডিরেক্টরি থেকে স্টার্ট স্ক্রিপ্ট রান করা
    sh ./mini-services-start.sh &
    MINI_PID=$!
    pids="$pids $MINI_PID"
    
    sleep 1
    if ! kill -0 "$MINI_PID" 2>/dev/null; then
        echo "⚠️  mini-services চালুকরণে সমস্যা হতে পারে, তবে মূল প্রসেস চলছে..."
    else
        echo "✅ mini-services চালু হয়েছে (PID: $MINI_PID)"
    fi
elif [ -d "./mini-services-dist" ]; then
    echo "⚠️  mini-services স্টার্ট স্ক্রিপ্ট পাওয়া যায়নি, তবে ডিরেক্টরিটি বিদ্যমান"
else
    echo "ℹ️  mini-services ডিরেক্টরি পাওয়া যায়নি, স্কিপ করা হলো"
fi

# Caddy চালু করা (যদি Caddyfile থাকে)
if [ -f "Caddyfile" ]; then
    echo "🚀 Caddy চালু করা হচ্ছে..."
    caddy run --config Caddyfile --adapter caddyfile &
    CADDY_PID=$!
    pids="$pids $CADDY_PID"
    echo "✅ Caddy ব্যাকগ্রাউন্ডে চালু হয়েছে (PID: $CADDY_PID)"
else
    echo "ℹ️  কোনো Caddyfile পাওয়া যায়নি, Caddy স্কিপ করা হলো"
fi

echo ""
echo "🎉 সকল সার্ভিস সফলভাবে চালু হয়েছে!"
echo ""
echo "💡 সমস্ত সার্ভিস বন্ধ করতে Ctrl+C চাপুন"
echo ""

# সকল ব্যাকগ্রাউন্ড প্রসেস চালু থাকা পর্যন্ত স্ক্রিপ্টটি সক্রিয় রাখা
wait
