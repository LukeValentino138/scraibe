import json
import boto3
import os

textract = boto3.client('textract')
s3 = boto3.client('s3')

def lambda_handler(event, context):
    try:
        print("Received Event:", json.dumps(event))

        query_params = event.get('queryStringParameters', {})
        job_id = query_params.get('jobId')

        if not job_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Missing jobId parameter.'}),
            }

        # Check Textract job status
        response = textract.get_document_text_detection(JobId=job_id)
        status = response['JobStatus']
        print(f"Textract Job status for JobId {job_id}: {status}")

        if status == 'SUCCEEDED':
            # Initialize variables for pagination
            pages = []
            next_token = None

            # Loop to retrieve all pages of results
            while True:
                if next_token:
                    response = textract.get_document_text_detection(JobId=job_id, NextToken=next_token)
                else:
                    response = textract.get_document_text_detection(JobId=job_id)

                pages.append(response)
                next_token = response.get('NextToken', None)
                if not next_token:
                    break  # All pages retrieved

            # Extract text from all pages
            text = ''
            for page in pages:
                text += ''.join([
                    block['Text'] + '\n' for block in page.get('Blocks', [])
                    if block['BlockType'] == 'LINE'
                ])

            # Save extracted text to S3
            output_bucket = os.environ['TEXTRACT_BUCKET']
            output_key = f'textract-output/{job_id}.txt'
            s3.put_object(Bucket=output_bucket, Key=output_key, Body=text)

            # Generate a presigned URL for the saved text
            presigned_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': output_bucket, 'Key': output_key},
                ExpiresIn=600  # 10 min url
            )

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'status': 'SUCCEEDED',
                    's3Key': output_key,
                    'presignedUrl': presigned_url
                }),
            }

        elif status == 'IN_PROGRESS':
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'status': 'IN_PROGRESS'}),
            }

        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'status': status}),
            }

    except Exception as e:
        print(f"Error in check-textract-job Lambda: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': str(e)}),
        }
