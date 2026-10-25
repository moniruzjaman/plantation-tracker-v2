#!/bin/bash

# stderr-কে stdout-এ রিডাইরেক্ট করা হচ্ছে, যাতে stderr আউটপুটের কারণে execute_command ব্যর্থ না হয়
exec 2>&1

set -e

# স্ক্রিপ্টটি যে ডিরেক্টরিতে আছে তা বের করা (.zscripts ডিরেক্টরি, অর্থাৎ workspace-agent/.zscripts)
# $0 ব্যবহার করা হচ্ছে স্ক্রিপ্টের পাথ পাওয়ার জন্য (sh এবং bash উভয়ের জন্য উপযোগী)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Next.js প্রজেক্টের পাথ
NEXTJS_PROJECT_DIR="/home/z/my-project"

# Next.js প্রজেক্ট ডিরেক্টরিটি বিদ্যমান কিনা তা পরীক্ষা করা
if [ ! -d "$NEXTJS_PROJECT_DIR" ]; then
    echo "❌ ত্রুটি: Next.js প্রজেক্ট ডিরেক্টরি পাওয়া যায়নি: $NEXTJS_PROJECT_DIR"
    exit 1
fi

echo "🚀 Next.js অ্যাপ্লিকেশন এবং mini-services বিল্ড করা শুরু হচ্ছে..."
echo "📁 Next.js প্রজেক্ট পাথ: $NEXTJS_PROJECT_DIR"

# Next.js প্রজেক্ট ডিরেক্টরিতে নেভিগেট করা
cd "$NEXTJS_PROJECT_DIR" || exit 1

# এনভায়রনমেন্ট ভেরিয়েবল সেট করা
export NEXT_TELEMETRY_DISABLED=1

BUILD_DIR="/tmp/build_fullstack_${BUILD_ID:-default}"
echo "📁 বিল্ড ডিরেক্টরি পরিষ্কার ও তৈরি করা হচ্ছে: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# ডিপেন্ডেন্সি ইনস্টল করা
echo "📦 ডিপেন্ডেন্সি ইনস্টল করা হচ্ছে..."
bun install

# Next.js অ্যাপ্লিকেশন বিল্ড করা
echo "🔨 Next.js অ্যাপ্লিকেশন বিল্ড করা হচ্ছে..."
bun run build

# standalone সার্ভার এন্ট্রি পয়েন্ট তৈরি হয়েছে কিনা পরীক্ষা করা (ডিপ্লয়মেন্ট গার্ড)।
# Next.js কেবল তখনই .next/standalone/server.js তৈরি করে যখন next.config-এ output:"standalone" থাকে।
# যদি ইউজার/AI এডিট করার সময় এই কনফিগ বদলে দেয় বা মুছে ফেলে, তবে bun run build সফল দেখালেও standalone ফাইল অনুপস্থিত থাকবে।
# এটি স্বয়ংক্রিয়ভাবে ঠিক করার চেষ্টা করবে: অনুপস্থিত থাকলে next.config-এ output:"standalone" যোগ করে পুনরায় বিল্ড করবে।
if [ ! -f ".next/standalone/server.js" ]; then
    echo "⚠️  .next/standalone/server.js তৈরি হয়নি, next.config-এর output কনফিগারেশন অটো-ফিক্স করা হচ্ছে..."
    NEXT_CONFIG_FILE="$(ls next.config.ts next.config.js next.config.mjs next.config.cjs 2>/dev/null | head -1)"

    if [ -z "$NEXT_CONFIG_FILE" ]; then
        echo "❌ বিল্ড ব্যর্থ: কোনো next.config.* পাওয়া যায়নি, standalone আউটপুট তৈরি করা অসম্ভব।"
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        # যদি কনফিগারে বলা থাকে কিন্তু তবুও server.js না তৈরি হয়, তবে অন্য কোনো অভ্যন্তরীণ ভুল আছে
        echo "❌ বিল্ড ব্যর্থ: $NEXT_CONFIG_FILE ফাইলটিতে output:\"standalone\" রয়েছে, কিন্তু তবুও .next/standalone/server.js তৈরি হয়নি।"
        echo "   দয়া করে ওপরের লগ থেকে মূল ভুলটি পরীক্ষা করুন।"
        exit 1
    fi

    if grep -Eq "output\s*:\s*['\"]" "$NEXT_CONFIG_FILE"; then
        # যদি অন্য কোনো output (যেমন "export") সেট করা থাকে
        echo "❌ বিল্ড ব্যর্থ: $NEXT_CONFIG_FILE ফাইালে standalone ব্যতীত অন্য output (যেমন \"export\") ঘোষণা করা আছে।"
        echo "   বর্তমান ডিপ্লয়মেন্টের জন্য output:\"standalone\" প্রয়োজন। দয়া করে এটি পরিবর্তন করুন।"
        exit 1
    fi

    echo "🔧 $NEXT_CONFIG_FILE-এ output:\"standalone\" পাওয়া যায়নি, স্বয়ংক্রিয়ভাবে ইনজেক্ট করে পুনরায় চেষ্টা করা হচ্ছে..."
    cp "$NEXT_CONFIG_FILE" "${NEXT_CONFIG_FILE}.zbak"

    # প্রথম কনফিগারেশন অবজেক্টের { এর পর output: "standalone" ইনজেক্ট করা
    perl -0pi -e 's/((?:const\s+\w+[^=]*=|export\s+default|module\.exports\s*=)\s*\{)/$1\n  output: "standalone",/' "$NEXT_CONFIG_FILE"

    if ! grep -Eq "output\s*:\s*['\"]standalone['\"]" "$NEXT_CONFIG_FILE"; then
        echo "❌ ম্যানুয়ালি output:\"standalone\" যুক্ত করা প্রয়োজন, স্বয়ংক্রিয় ইনজেকশন ব্যর্থ হয়েছে।"
        echo "   বর্তমান $NEXT_CONFIG_FILE কন্টেন্ট:"
        cat "$NEXT_CONFIG_FILE"
        mv "${NEXT_CONFIG_FILE}.zbak" "$NEXT_CONFIG_FILE"
        exit 1
    fi

    echo "🔨 output:\"standalone\" ইনজেক্ট করা হয়েছে, পুনরায় বিল্ড হচ্ছে..."
    bun run build

    if [ ! -f ".next/standalone/server.js" ]; then
        echo "❌ ইনজেকশন দেওয়ার পরও .next/standalone/server.js তৈরি করা সম্ভব হয়নি।"
        rm -f "${NEXT_CONFIG_FILE}.zbak"
        exit 1
    fi
    echo "✅ অটো-ফিক্স সফল: standalone সার্ভার এন্ট্রি পয়েন্ট তৈরি হয়েছে।"
    rm -f "${NEXT_CONFIG_FILE}.zbak"
fi

# mini-services বিল্ড করা
# Next.js প্রজেক্ট ডিরেক্টরিতে mini-services ডিরেক্টরি আছে কিনা পরীক্ষা করা
if [ -d "$NEXTJS_PROJECT_DIR/mini-services" ]; then
    echo "🔨 mini-services বিল্ড করা হচ্ছে..."
    # workspace-agent ডিরেক্টরির mini-services স্ক্রিপ্ট ব্যবহার করা
    sh "$SCRIPT_DIR/mini-services-install.sh"
    sh "$SCRIPT_DIR/mini-services-build.sh"

    # mini-services-start.sh ফাইলটি mini-services-dist ডিরেক্টরিতে কপি করা
    echo "  - mini-services-start.sh কে $BUILD_DIR ডিরেক্টরিতে কপি করা হচ্ছে"
    cp "$SCRIPT_DIR/mini-services-start.sh" "$BUILD_DIR/mini-services-start.sh"
    chmod +x "$BUILD_DIR/mini-services-start.sh"
else
    echo "ℹ️  mini-services ডিরেক্টরি পাওয়া যায়নি, স্কিপ করা হলো"
fi

# সমস্ত বিল্ড আউটপুট টেম্পোরারি বিল্ড ডিরেক্টরিতে কপি করা
echo "📦 সকল আউটপুট $BUILD_DIR-এ সংগ্রহ করা হচ্ছে..."

# Next.js standalone আউটপুট কপি করা
if [ -d ".next/standalone" ]; then
    echo "  - .next/standalone কপি করা হচ্ছে"
    mkdir -p "$BUILD_DIR/next-service-dist"
    cp -R .next/standalone/. "$BUILD_DIR/next-service-dist/"
fi

# Next.js স্ট্যাটিক ফাইল কপি করা
if [ -d ".next/static" ]; then
    echo "  - .next/static কপি করা হচ্ছে"
    mkdir -p "$BUILD_DIR/next-service-dist/.next/static"
    cp -R .next/static/. "$BUILD_DIR/next-service-dist/.next/static/"
fi

# public ডিরেক্টরি কপি করা
if [ -d "public" ]; then
    echo "  - public কপি করা হচ্ছে"
    mkdir -p "$BUILD_DIR/next-service-dist/public"
    cp -R public/. "$BUILD_DIR/next-service-dist/public/"
fi

# টেস্ট এনভায়রনমেন্টের ডাটাবেসটি প্রডাকশন বান্ডেলে কপি করা
if [ -f "./db/custom.db" ]; then
    echo "🗄️  টেস্ট ডাটাবেস বিল্ড প্যাকেজে কপি করা হচ্ছে..."
    mkdir -p "$BUILD_DIR/db"
    cp -R ./db/. "$BUILD_DIR/db/"

    echo "🗄️  ডাটাবেস স্ট্রাকচার সিঙ্ক করা হচ্ছে..."
    DATABASE_URL="file:$BUILD_DIR/db/custom.db" bun run db:push
    echo "✅ বিল্ড ডাটাবেস প্রস্তুতি সম্পূর্ণ"
    ls -lah "$BUILD_DIR/db"
else
    echo "❌ টেস্ট ডাটাবেস ফাইলটি (./db/custom.db) পাওয়া যায়নি, বিল্ড বজায় রাখা সম্ভব নয়।"
    exit 1
fi

# Caddyfile কপি করা (যদি থাকে)
if [ -f "Caddyfile" ]; then
    echo "  - Caddyfile কপি করা হচ্ছে"
    cp Caddyfile "$BUILD_DIR/"
else
    echo "ℹ️  Caddyfile ফাইলটি নেই, স্কিপ করা হলো"
fi

# start.sh স্ক্রিপ্ট কপি করা
echo "  - start.sh ফাইলটি $BUILD_DIR-এ কপি করা হচ্ছে"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

# $BUILD_DIR.tar.gz ফরম্যাটে আর্কাইভ করা
PACKAGE_FILE="${BUILD_DIR}.tar.gz"
echo ""
echo "📦 বিল্ড আউটপুটকে $PACKAGE_FILE ফাইলে জিপ/আর্কাইভ করা হচ্ছে..."
cd "$BUILD_DIR" || exit 1
tar -czf "$PACKAGE_FILE" .
cd - > /dev/null || exit 1

echo ""
echo "✅ বিল্ড সম্পূর্ণ! সমস্ত ফাইল $PACKAGE_FILE প্যাকেজে সংরক্ষিত হয়েছে।"
echo "📊 ফাইল সাইজ:"
ls -lh "$PACKAGE_FILE"
