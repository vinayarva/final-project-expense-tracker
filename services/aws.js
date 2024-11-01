const { S3Client ,DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');


const region = process.env.REGION
const BUCKET_NAME = process.env.BUCKET_NAME
const IAM_USER = process.env.IAM_USER
const IAM_USER_SECRET = process.env.IAM_USER_SECRET


const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: IAM_USER,
        secretAccessKey: IAM_USER_SECRET
    }
})


const uploadtos3 = async (filename, data) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',ContentType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/png',
        ContentDisposition: 'inline' // Display both images and PDFs inline
    
    };

    try {
        const upload = new Upload({
            client: s3Client,
            params,
        });

        await upload.done(); // Await the upload to complete
        const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${filename}`;
        // console.log(url);
        return url;
    } catch (err) {
        console.error("Error uploading file:", err);
        throw err;
    }
};


const deleteFileFromS3 = async (fileName) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName // The name of the file to delete
    };

    try {
        const data = await s3Client.send(new DeleteObjectCommand(params));
        console.log(`File deleted successfully: ${fileName}`);
    } catch (err) {
        console.error(`Error deleting file: ${err.message}`);
    }
};





module.exports = {
    uploadtos3,
    deleteFileFromS3
};
