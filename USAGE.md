# AI Deductive Qualitative Coding App

## Features Implemented

✅ **Document Upload**
- Drag & drop PDF file upload
- PDF text extraction using PDF.js
- Display document info (name, total pages)

✅ **Tag Management**
- Add custom coding tags with descriptions
- Remove tags
- Visual status indicators (idle, processing, completed, no results)

✅ **AI Configuration**
- Support for OpenAI, Anthropic (Claude), and custom endpoints
- Secure API key input
- Model selection

✅ **Analysis Progress**
- Real-time progress tracking
- Current tag being processed
- Progress bar and percentage

✅ **Results Display**
- Export results to JSON
- Summary statistics
- Expandable quote views
- Visual distinction between tags with/without results

## How to Use

1. **Upload a PDF**: Drag and drop a PDF file or click to select
2. **Add Tags**: Create tags with names and descriptions (e.g., "Patient Safety" - "References to patient safety concerns")
3. **Configure AI**: Enter your API key and select AI provider
4. **Start Analysis**: Click "Start Analysis" to begin processing
5. **View Results**: Expand tags to see relevant quotes found by AI

## Supported AI Providers

- **OpenAI**: GPT-3.5, GPT-4, etc.
- **Anthropic**: Claude-3 models
- **Custom**: Any OpenAI-compatible API endpoint

## Testing the PDF Upload Fix

The PDF upload issue has been resolved by:
1. Using a stable version of pdfjs-dist (3.11.174)
2. Configuring proper CDN URLs for worker and character maps
3. Adding comprehensive error handling and logging
4. Improved error messages for better debugging

Try uploading a PDF file now - you should see console logs showing the parsing progress, and the app should successfully extract text from your PDF document.

## Next Steps

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Ensure your PDF is not password-protected or corrupted
3. Try with a simple text-based PDF first
4. Verify your internet connection for CDN resources
