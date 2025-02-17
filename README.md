# NoAwsConfirmDeleteInput
A Tampermonkey script to autofill the annoying confirmations when attempting to delete AWS resources

## Supported Resource Operations
- s3:
  - Bucket Delete
  - Bucket Empty
  - Object(s) Delete

## Installation
Note that Tampermonkey is required for this script to work
- Navigate to https://raw.githubusercontent.com/EtK2000/NoAwsConfirmDeleteInput/refs/heads/master/script.js
- If Tampermonkey doesn't ask to install the script:
  1. Open Tampermonkey dashboard
  2. Navigate to Utilities in the top right corner
  3. Paste the above URL into the textbox next to `Import from URL`
  4. Click Install
