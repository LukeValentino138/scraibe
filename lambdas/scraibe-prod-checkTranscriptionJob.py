import json
import boto3
import os

transcribe = boto3.client('transcribe')

def lambda_handler(event, context):
    try:
        params = event.get('queryStringParameters', {})
        job_name = params.get('jobName')

        if not job_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Missing jobName parameter.'})
            }

        # Check transcription job status
        status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        job_status = status['TranscriptionJob']['TranscriptionJobStatus']

        if job_status == 'COMPLETED':
            # retrieve transcription URL
            transcription_url = status['TranscriptionJob']['Transcript']['TranscriptFileUri']

            response = boto3.client('s3').get_object(
                Bucket= os.environ['TRANSCRIPTION_BUCKET'] ,
                Key=f"{job_name}.json"  
            )
            transcription_content = json.loads(response['Body'].read())
            transcription_text = transcription_content['results']['transcripts'][0]['transcript']

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'status': 'COMPLETED', 'transcription': transcription_text})
            }

        elif job_status == 'FAILED':
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'status': 'FAILED'})
            }

        else:  # IN_PROGRESS
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'status': 'IN_PROGRESS'})
            }

    except Exception as e:
        print(f"Error: {e}")
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
