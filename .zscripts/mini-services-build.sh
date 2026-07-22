#!/bin/bash

set -euo pipefail

# স্ক্রিপ্ট এবং প্রজেক্টের রুট ডিরেক্টরি নির্ণয়
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." 2>/dev/null && pwd || echo "$SCRIPT_DIR")"

# কনফিগারেশন (ডিফল্ট ভ্যালু সহ)
BUILD_ID="${BUILD_ID:-default}"
ROOT_DIR="${ROOT_DIR:-$PROJECT_DIR/mini-services}"
DIST_DIR="/tmp/build_fullstack_$BUILD_ID/mini-services-dist"

main() {
    echo "🚀 বাল্ক বিল্ড শুরু হচ্ছে..."
    
    # bun ইনস্টল করা আছে কিনা তা পরীক্ষা করা
    if ! command -v bun >/dev/null 2>&1; then
        echo "❌ ভুল: 'bun' কমান্ড পাওয়া যায়নি। অনুগ্রহ করে Bun ইনস্টল করুন।"
        exit 1
    fi
    
    # Root ডিরেক্টরি বিদ্যমান কিনা তা পরীক্ষা করা
    if [ ! -d "$ROOT_DIR" ]; then
        echo "ℹ️  ডিরেক্টরি $ROOT_DIR পাওয়া যায়নি, বিল্ড স্কিপ করা হচ্ছে"
        return 0
    fi
    
    # আউটপুট ডিরেক্টরি তৈরি করা (যদি বিদ্যমান না থাকে)
    mkdir -p "$DIST_DIR"
    
    # পরিসংখ্যান ভেরিয়াবল
    success_count=0
    fail_count=0
    
    # ফাঁকা গ্লোব এড়াতে nullglob সেট করা
    shopt -s nullglob
    local dirs=("$ROOT_DIR"/*)
    shopt -u nullglob
    
    if [ ${#dirs[@]} -eq 0 ]; then
        echo "ℹ️  $ROOT_DIR ডিরেক্টরিতে কোনো প্রজেক্ট পাওয়া যায়নি"
        return 0
    fi
    
    # mini-services ডিরেক্টরির অন্তর্গত সমস্ত ফোল্ডার স্ক্যান করা
    for dir in "${dirs[@]}"; do
        # এটি ডিরেক্টরি কিনা এবং package.json আছে কিনা পরীক্ষা করা
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            project_name=$(basename "$dir")
            
            # এন্ট্রি ফাইল খোঁজা (অগ্রাধিকার অনুযায়ী)
            entry_path=""
            for entry in "src/index.ts" "index.ts" "src/index.js" "index.js"; do
                if [ -f "$dir/$entry" ]; then
                    entry_path="$dir/$entry"
                    break
                fi
            done
            
            if [ -z "$entry_path" ]; then
                echo "⚠️  $project_name স্কিপ করা হয়েছে: কোনো এন্ট্রি ফাইল (index.ts/js) পাওয়া যায়নি"
                continue
            fi
            
            echo ""
            echo "📦 বিল্ড করা হচ্ছে: $project_name..."
            
            # bun build CLI ব্যবহার করে বিল্ড করা
            output_file="$DIST_DIR/mini-service-$project_name.js"
            
            if bun build "$entry_path" \
                --outfile "$output_file" \
                --target bun \
                --minify; then
                echo "✅ $project_name সফলভাবে বিল্ড হয়েছে -> $output_file"
                success_count=$((success_count + 1))
            else
                echo "❌ $project_name বিল্ড ব্যর্থ হয়েছে"
                fail_count=$((fail_count + 1))
            fi
        fi
    done
    
    # স্টার্ট স্ক্রিপ্ট কপি করা (ডাইনামিক পাথ চেক সহ)
    local start_script="$PROJECT_DIR/.zscripts/mini-services-start.sh"
    if [ ! -f "$start_script" ]; then
        start_script="./.zscripts/mini-services-start.sh"
    fi

    if [ -f "$start_script" ]; then
        cp "$start_script" "$DIST_DIR/mini-services-start.sh"
        chmod +x "$DIST_DIR/mini-services-start.sh"
        echo "📄 স্টার্ট স্ক্রিপ্ট কপি করা হয়েছে: $DIST_DIR/mini-services-start.sh"
    fi
    
    echo ""
    echo "🎉 সমস্ত টাস্ক সম্পন্ন হয়েছে!"
    if [ $success_count -gt 0 ] || [ $fail_count -gt 0 ]; then
        echo "✅ সফল: $success_count টি"
        if [ $fail_count -gt 0 ]; then
            echo "❌ ব্যর্থ: $fail_count টি"
        fi
    fi
}

main
