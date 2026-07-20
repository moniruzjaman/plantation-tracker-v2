#!/bin/sh

# কনফিগারেশন
DIST_DIR="./mini-services-dist"

# সকল সাব-প্রসেসের (Sub-process) PID সংরক্ষণের ভেরিয়াবল
pids=""

# ক্লিনআপ ফাংশন: সফলভাবে সমস্ত সার্ভিস বন্ধ করা
cleanup() {
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
            # এখনও চললে সর্বোচ্চ ৪ সেকেন্ড অপেক্ষা করা হবে
            timeout=4
            while [ $timeout -gt 0 ] && kill -0 "$pid" 2>/dev/null; do
                sleep 1
                timeout=$((timeout - 1))
            done
            # এখনও চলতে থাকলে জোরপূর্বক বন্ধ (Force kill) করা হচ্ছে
            if kill -0 "$pid" 2>/dev/null; then
                echo "   প্রসেস $pid জোরপূর্বক বন্ধ করা হচ্ছে..."
                kill -KILL "$pid" 2>/dev/null
            fi
        fi
    done
    
    echo "✅ সমস্ত সার্ভিস সফলভাবে বন্ধ করা হয়েছে"
}

# স্ক্রিপ্ট বন্ধ বা ইন্টারাপ্ট (Ctrl+C) হলে ক্লিনআপ ফাংশন ট্রিগার করা
trap cleanup EXIT INT TERM

main() {
    echo "🚀 সকল mini services চালু করা হচ্ছে..."
    
    # dist ডিরেক্টরি বিদ্যমান কিনা তা পরীক্ষা করা
    if [ ! -d "$DIST_DIR" ]; then
        echo "ℹ️  ডিরেক্টরি $DIST_DIR পাওয়া যায়নি"
        return
    fi
    
    # সকল mini-service-*.js ফাইল খোঁজা হচ্ছে
    service_files=""
    for file in "$DIST_DIR"/mini-service-*.js; do
        if [ -f "$file" ]; then
            if [ -z "$service_files" ]; then
                service_files="$file"
            else
                service_files="$service_files $file"
            fi
        fi
    done
    
    # সার্ভিস ফাইলের সংখ্যা গণনা করা হচ্ছে
    service_count=0
    for file in $service_files; do
        service_count=$((service_count + 1))
    done
    
    if [ $service_count -eq 0 ]; then
        echo "ℹ️  কোনো mini service ফাইল পাওয়া যায়নি"
        return
    fi
    
    echo "📦 $service_count টি সার্ভিস পাওয়া গেছে, চালু করা হচ্ছে..."
    echo ""
    
    # প্রতিটি সার্ভিস চালু করা
    for file in $service_files; do
        service_name=$(basename "$file" .js | sed 's/mini-service-//')
        echo "▶️  সার্ভিস চালু করা হচ্ছে: $service_name..."
        
        # bun দিয়ে সার্ভিস ব্যাকগ্রাউন্ডে চালানো হচ্ছে
        bun "$file" &
        pid=$!
        if [ -z "$pids" ]; then
            pids="$pid"
        else
            pids="$pids $pid"
        fi
        
        # প্রসেসটি সফলভাবে চালু হয়েছে কিনা পরীক্ষা করার জন্য সামান্য সময় অপেক্ষা
        sleep 0.5
        if ! kill -0 "$pid" 2>/dev/null; then
            echo "❌ $service_name চালুকরণ ব্যর্থ হয়েছে"
            # ব্যর্থ PID-টি পোর্টেবল উপায়ে স্ট্রিং থেকে সরিয়ে ফেলা হচ্ছে (POSIX-compliant)
            updated_pids=""
            for p in $pids; do
                if [ "$p" != "$pid" ]; then
                    updated_pids="$updated_pids $p"
                fi
            done
            pids="$updated_pids"
        else
            echo "✅ $service_name চালু হয়েছে (PID: $pid)"
        fi
    done
    
    # চলমান সার্ভিসের সংখ্যা গণনা করা হচ্ছে
    running_count=0
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            running_count=$((running_count + 1))
        fi
    done
    
    echo ""
    echo "🎉 সকল সার্ভিস চালু হয়েছে! মোট $running_count টি সার্ভিস চলছে"
    echo ""
    echo "💡 সমস্ত সার্ভিস বন্ধ করতে Ctrl+C চাপুন"
    echo ""
    
    # সকল ব্যাকগ্রাউন্ড প্রসেসের জন্য অপেক্ষা
    wait
}

main
