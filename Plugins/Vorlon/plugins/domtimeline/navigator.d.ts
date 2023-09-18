interface Navigator {
    msSaveBlob: (blobOrBase64: Blob | string, filename: string) => void
}