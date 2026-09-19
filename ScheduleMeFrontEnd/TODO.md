The split is feasible, but the generated client has two gaps:
•	Upload methods accept no file or request body.
•	Schedule download defaults to JSON, not Blob.

Your generated AccountsService currently cannot send uploaded files, and its download method tries to read files as JSON.
Recommendation: split session management from API access now and switch the supported calls to AccountsService. Temporarily keep the existing upload/download calls working. Those last calls can move after the generated client is corrected.