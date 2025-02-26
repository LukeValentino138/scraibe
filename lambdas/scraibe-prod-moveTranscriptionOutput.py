import boto3
import urllib.parse
import json

s3 = boto3.client('s3')

def lambda_handler(event, context):
    for record in event.get('Records', []):
        source_bucket = record['s3']['bucket']['name']
        source_key = urllib.parse.unquote_plus(record['s3']['object']['key'])
        
        target_key = f"transcriptions/{source_key}"
        
        # copy object to new location
        copy_source = {'Bucket': source_bucket, 'Key': source_key}
        s3.copy_object(Bucket=source_bucket, CopySource=copy_source, Key=target_key)
        
        s3.delete_object(Bucket=source_bucket, Key=source_key)
        
    return {"statusCode": 200, "body": "Transcription file moved successfully."}
