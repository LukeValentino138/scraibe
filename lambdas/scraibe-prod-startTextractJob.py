import json
import boto3
import os

textract = boto3.client('textract')

def lambda_handler(event, context):
    try:
        print("Received event:", json.dumps(event))
        
        # parse body
        if "body" not in event or not event["body"]:
            error_msg = "Missing request body."
            print(error_msg)
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": error_msg})
            }
        
        try:
            body = json.loads(event["body"])
        except Exception as parse_err:
            error_msg = f"Error parsing request body: {parse_err}"
            print(error_msg)
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": error_msg})
            }
        
        file_key = body.get("fileKey")
        if not file_key:
            error_msg = "Missing fileKey in request body."
            print(error_msg)
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": error_msg})
            }
        
        # Log bucket and file key information
        bucket_name = os.environ['BUCKET_NAME']
        print(f"Starting Textract job for bucket: {bucket_name}, fileKey: {file_key}")
        
        # Start the Textract job
        response = textract.start_document_text_detection(
            DocumentLocation={
                "S3Object": {
                    "Bucket": bucket_name,
                    "Name": file_key,
                }
            }
        )
        
        job_id = response.get("JobId")
        print(f"Textract job started successfully. JobId: {job_id}")
        
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"jobId": job_id})
        }
    except Exception as e:
        print("Exception occurred in Textract Lambda:", str(e))
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }
