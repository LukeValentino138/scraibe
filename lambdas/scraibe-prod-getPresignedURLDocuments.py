import json
import boto3
import time
import re
import os

s3 = boto3.client('s3')

ALLOWED_FILE_EXTENSION = 'pdf'
CONTENT_TYPE = 'application/pdf'

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
        
        # Remove parentheses and replace spaces with underscores
        file_name = re.sub(r'[()]', '', file_name)
        file_name = re.sub(r'\s+', '_', file_name)

        # validate file name ,allow only alphanumeric characters, underscores, dashes, dots, and spaces.
        if not re.match(r'^[\w\-.]+$', file_name):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid fileName parameter.'})
            }
        
        # Check that file is pdf
        ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else ''
        if ext != ALLOWED_FILE_EXTENSION:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Unsupported file type: {ext}. Only PDF files are allowed.'})
            }
        
        # generate file name using a timestamp
        timestamp = int(time.time())
        unique_file_name = f"{timestamp}_{file_name}"
        bucket_name = os.environ['PDF_FILES_BUCKET_NAME']
        s3_object_key = f"uploads/{unique_file_name}"

        # generate the presigned URL 
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': s3_object_key,
                'ContentType': CONTENT_TYPE,
            },
            ExpiresIn=600 #10 min expiry
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
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
