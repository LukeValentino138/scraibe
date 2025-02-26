import json
import boto3
import uuid
import os

transcribe = boto3.client('transcribe')

def lambda_handler(event, context):
    try:
        print("Received Event:", json.dumps(event)) # debugging

        # parse body
        body = json.loads(event.get('body', '{}'))
        s3_object_key = body.get('s3ObjectKey')

        if not s3_object_key:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                },
                'body': json.dumps({'error': 'Missing s3ObjectKey in request body.'})
            }

        # start transcription job
        audio_bucket = os.environ['AUDIO_BUCKET']   
        job_name = f'TranscriptionJob_{uuid.uuid4()}'
        media_uri = f's3://{audio_bucket}/{s3_object_key}'

        transcribe.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': media_uri},
            MediaFormat=s3_object_key.split('.')[-1],  # Extract file format from key
            LanguageCode='en-US',
            OutputBucketName=audio_bucket
        )

        # Respond with the job name
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            },
            'body': json.dumps({'jobName': job_name})
        }

    except Exception as e:
        print(f"Error: {e}")  # Debugging log
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            },
            'body': json.dumps({'error': str(e)})
        }
