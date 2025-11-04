#!/bin/bash

echo "🔍 Dandelion API Diagnostic Tool"
echo "================================"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "✅ .env file found"
    
    # Check if token is set
    if grep -q "VITE_DANDELION_API_TOKEN=" .env; then
        TOKEN=$(grep "VITE_DANDELION_API_TOKEN=" .env | cut -d '=' -f2)
        
        if [ "$TOKEN" = "your_dandelion_api_token_here" ] || [ -z "$TOKEN" ]; then
            echo "❌ VITE_DANDELION_API_TOKEN is not configured (using placeholder)"
            echo ""
            echo "📋 Next Steps:"
            echo "1. Get your API token from: https://dandelion.eu/profile/dashboard/"
            echo "2. Edit .env file and replace the placeholder with your actual token"
            echo "3. Restart the dev server: npm run dev"
        else
            echo "✅ VITE_DANDELION_API_TOKEN is configured"
            echo "🔑 Token length: ${#TOKEN} characters"
            echo ""
            echo "🧪 Testing API connection..."
            
            # Test API call
            RESPONSE=$(curl -s -w "\n%{http_code}" "https://api.dandelion.eu/datatxt/nex/v1?text=machine%20learning&token=$TOKEN&confidence=0.5&lang=en")
            HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
            BODY=$(echo "$RESPONSE" | head -n -1)
            
            if [ "$HTTP_CODE" = "200" ]; then
                echo "✅ API Connection Successful!"
                echo "📊 Response: $(echo $BODY | head -c 100)..."
            else
                echo "❌ API Connection Failed"
                echo "📊 HTTP Status: $HTTP_CODE"
                echo "📊 Response: $BODY"
                echo ""
                echo "🔧 Possible issues:"
                echo "   - Invalid or expired API token"
                echo "   - Daily request limit exceeded (free tier: 1,000/day)"
                echo "   - Network connectivity issues"
            fi
        fi
    else
        echo "❌ VITE_DANDELION_API_TOKEN not found in .env file"
    fi
else
    echo "❌ .env file not found"
    echo ""
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please add your Dandelion API token."
fi

echo ""
echo "================================"
echo "📚 For more help, see: DANDELION-API-SETUP.md"
