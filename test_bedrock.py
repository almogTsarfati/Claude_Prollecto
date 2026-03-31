import boto3
import json

# Initialize Bedrock client
client = boto3.client('bedrock-runtime', region_name='il-central-1')

# Test prompt
prompt = "Hello, Claude! Can you confirm this connection works?"

# Prepare the request for Claude Haiku (messages format)
body = json.dumps({
    "messages": [
        {
            "role": "user",
            "content": prompt
        }
    ],
    "max_tokens": 64,
    "temperature": 0.1,
    "anthropic_version": "bedrock-2023-05-31"
})

# Call Bedrock with Claude Haiku 4.5 inference profile
response = client.invoke_model(
    modelId='global.anthropic.claude-haiku-4-5-20251001-v1:0',
    body=body,
    contentType='application/json',
    accept='application/json'
)

# Parse response
response_body = json.loads(response['body'].read())
print("Response:", response_body.get('content', [{}])[0].get('text', 'No response'))