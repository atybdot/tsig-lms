const { google } = require('googleapis');
const fs = require('fs');

// Load your credentials JSON file (downloaded from Google Cloud Console)
const credentials = require('./optical-victor-447707-v7-76e9aef5fde4.json');

// Authenticate using Google Auth
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Function to upload a file to Google Drive
async function uploadToGoogleDrive(filePath, fileName, folderId = null) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : [], // Add folder ID if needed
    };

    const media = {
      mimeType: 'image/jpeg', // Adjust mime type as needed
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    console.log('File uploaded successfully:', response.data);
    return response.data; // Contains file ID and links
  } catch (error) {
    console.error('Error uploading file:', error.message);
  }
}

// Function to share file with specific user
async function shareFileWithUser(fileId, targetEmail) {
  try {
    console.log('Starting share process for file:', fileId);
    
    // Create shared folder
    const folderMetadata = {
      name: 'SharedUploads',
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name'
    });
    
    console.log('Created folder:', folder.data.name, 'with ID:', folder.data.id);
    
    // Get file's current parents
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'parents, name'
    });
    
    console.log('Moving file:', file.data.name, 'Current parents:', file.data.parents);

    // Move file to new folder
    const updatedFile = await drive.files.update({
      fileId: fileId,
      addParents: folder.data.id,
      removeParents: file.data.parents ? file.data.parents.join(',') : '',
      fields: 'id, parents, name'
    });
    
    console.log('File moved. New parents:', updatedFile.data.parents);

    // Verify file is in new folder
    const verifyFile = await drive.files.get({
      fileId: fileId,
      fields: 'parents'
    });
    
    console.log('Final verification - File parents:', verifyFile.data.parents);

    // Add sharing permissions for the folder
    await drive.permissions.create({
      fileId: folder.data.id,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: targetEmail
      },
      sendNotificationEmail: true
    });

    console.log(`Folder shared with ${targetEmail}`);

    return {
      success: true,
      fileId: fileId,
      folderId: folder.data.id,
      newParents: verifyFile.data.parents,
      sharedWith: targetEmail
    };
  } catch (error) {
    console.error('Error in share process:', error);
    throw error;
  }
}

// Main function to handle file upload and shareable link creation
// (async () => {
//   try {
//     const filePath = './test.jpeg';
//     const fileName = 'test.jpeg';
//     const targetEmail = 'storage.tsig@gmail.com';

//     console.log('Uploading file to Google Drive...');
//     const uploadedFile = await uploadToGoogleDrive(filePath, fileName);
    
//     if (uploadedFile) {
//       console.log('Sharing file...');
//       const result = await shareFileWithUser(uploadedFile.id, targetEmail);
//       console.log('File sharing completed:', result);
//     }
//   } catch (error) {
//     console.error('Error in main process:', error);
//   }
// })();

module.exports = {
  uploadToGoogleDrive,
  shareFileWithUser
};
