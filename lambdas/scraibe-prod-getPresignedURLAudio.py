import json
import boto3
import time
import os
import re

s3 = boto3.client('s3')

ALLOWED_AUDIO_TYPES = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/x-m4a' 
}

def lambda_handler(event, context):
    try:
        params = event.get('queryStringParameters', {})
        file_name = params.get('fileName')

        if not file_name:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing fileName parameter.'})
            }
        
        file_name = re.sub(r'[()]', '', file_name)

        # validate file name
        if not re.match(r'^[\w\-. ]+$', file_name):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid fileName parameter.'})
            }
        
        # check file extension and content type
        ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else ''
        content_type = ALLOWED_AUDIO_TYPES.get(ext)
        if not content_type:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': f'Unsupported audio file type: {ext}. Supported types: {", ".join(ALLOWED_AUDIO_TYPES.keys())}.'
                })
            }

        # generate file name
        timestamp = int(time.time())
        unique_file_name = f"{timestamp}_{file_name}"
        bucket_name = os.environ['AUDIO_BUCKET']
        s3_object_key = f"uploads/{unique_file_name}"

        # generate presigned url
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': s3_object_key,
                'ContentType': content_type,
            },
            ExpiresIn=600  # 10 min url
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
            },
            'body': json.dumps({'presignedUrl': presigned_url, 's3ObjectKey': s3_object_key})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*', 
            },
            'body': json.dumps({'error': str(e)})
        }
