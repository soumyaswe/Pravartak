"use client";

/*
* Pravartak - AI Cover Letter Generator
*
* This component is a self-contained Next.js page for the
* AI Cover Letter Generator.
*
* REQUIRED DEPENDENCIES:
* This component now loads dependencies (pdf.js, mammoth, html2pdf.js)
* from a CDN, so no additional 'npm install' is needed for them.
* You still need 'lucide-react'.
*/

import React, { useState, useRef, useCallback, useEffect } from 'react';

// --- Icon Imports (from lucide-react) ---
import {
    Upload,
    Download,
    Save,
    History,
    Loader2,
    X
} from 'lucide-react';

// --- Reusable UI Components (Styled as per your docs) ---

// Corresponds to <Label> from Radix
const Label = React.forwardRef(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={`block text-sm font-medium text-[#A3A3A3] mb-2 ${className}`}
        {...props}
    />
));
Label.displayName = 'Label';

// Corresponds to <Input> from Radix
const Input = React.forwardRef(({ className, type, ...props }, ref) => (
    <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA]
                    file:border-0 file:bg-transparent file:text-sm file:font-medium
                    placeholder:text-[#A3A3A3]
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FAFAFA]
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${className}`}
        ref={ref}
        {...props}
    />
));
Input.displayName = 'Input';

// Corresponds to <Textarea> from Radix
const Textarea = React.forwardRef(({ className, ...props }, ref) => (
    <textarea
        className={`flex min-h-[120px] w-full rounded-md border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA]
                    placeholder:text-[#A3A3A3]
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FAFAFA]
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${className}`}
        ref={ref}
        {...props}
    />
));
Textarea.displayName = 'Textarea';

// Corresponds to <Select> from Radix
const Select = React.forwardRef(({ className, children, ...props }, ref) => (
    <select
        className={`flex h-10 w-full rounded-md border border-[#262626] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA]
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FAFAFA]
                    disabled:cursor-not-allowed disabled:opacity-50
                    ${className}`}
        ref={ref}
        {...props}
    >
        {children}
    </select>
));
Select.displayName = 'Select';

// Corresponds to <Button> from Radix
const Button = React.forwardRef(({ className, variant = 'outline', size = 'default', ...props }, ref) => {
    const variants = {
        primary: 'bg-[#FAFAFA] text-[#0A0A0A] border-[#FAFAFA] hover:bg-[#A3A3A3] hover:border-[#A3A3A3]',
        outline: 'bg-transparent text-[#FAFAFA] border-[#262626] hover:bg-[#262626]',
        ghost: 'bg-transparent text-[#FAFAFA] hover:bg-[#262626]',
    };
    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    return (
        <button
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
                        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FAFAFA]
                        disabled:pointer-events-none disabled:opacity-50
                        ${variants[variant]} ${sizes[size]} ${className}`}
            ref={ref}
            {...props}
        />
    );
});
Button.displayName = 'Button';


// --- Main Page Component ---
export default function CoverLetterGenerator() {
    // --- State ---
    const [fileName, setFileName] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [tone, setTone] = useState('Professional');
    const [letterHtml, setLetterHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [libsLoaded, setLibsLoaded] = useState(false);

    // --- Refs ---
    const fileInputRef = useRef(null);
    const letterContentRef = useRef(null);
    const pdfjsLibRef = useRef(null);
    const mammothRef = useRef(null);
    const html2pdfRef = useRef(null);

    // --- Toast Notification ---
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    // --- Load Client-Side Libraries Dynamically ---
    useEffect(() => {
        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        const loadLibs = async () => {
            try {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js');
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;
                pdfjsLibRef.current = window.pdfjsLib;

                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.18/mammoth.browser.min.js');
                mammothRef.current = window.mammoth;

                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
                html2pdfRef.current = window.html2pdf;

                setLibsLoaded(true);
                console.log("Client-side libraries loaded from CDN.");
            } catch (err) {
                console.error("Failed to load client-side libraries:", err);
                showToast("Error loading document tools. Please refresh.", "error");
            }
        };
        loadLibs();
    }, []);

    // --- File Parsing Logic ---
    const extractTextFromPdf = (file) => {
        if (!pdfjsLibRef.current) {
            showToast("PDF tools are still loading. Please try again in a moment.", "error");
            return;
        }
        const pdfjsLib = pdfjsLibRef.current;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
                setResumeText(fullText);
                setFileName(`✓ ${file.name} (Ready)`);
                showToast('Resume text extracted successfully!');
            } catch (err) {
                console.error('PDF parsing error:', err);
                showToast('Error parsing PDF file.', 'error');
                resetFileInput();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const extractTextFromDocx = (file) => {
        if (!mammothRef.current) {
            showToast("Word tools are still loading. Please try again in a moment.", "error");
            return;
        }
        const mammoth = mammothRef.current;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
                setResumeText(result.value);
                setFileName(`✓ ${file.name} (Ready)`);
                showToast('Resume text extracted successfully!');
            } catch (err) {
                console.error('DOCX parsing error:', err);
                showToast('Error parsing DOCX file.', 'error');
                resetFileInput();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const resetFileInput = () => {
        setFileName('');
        setResumeText('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFile = (file) => {
        if (!file) return;

        if (!libsLoaded) {
            showToast("Document tools are still loading. Please try again in a moment.", "error");
            return;
        }
        
        if (file.type === 'application/pdf') {
            setFileName('Extracting text from ' + file.name);
            extractTextFromPdf(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setFileName('Extracting text from ' + file.name);
            extractTextFromDocx(file);
        } else {
            showToast('Error: Please upload a PDF or DOCX file.', 'error');
            resetFileInput();
        }
    };

    // --- Dropzone Event Handlers ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [libsLoaded]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    // --- Core Actions ---
    const handleGenerate = useCallback(async () => {
        if (!jobTitle || !companyName || !jobDescription) {
            showToast('Please fill in Job Title, Company Name, and Job Description.', 'error');
            return;
        }
        if (!resumeText) {
            showToast('Please upload your resume first.', 'error');
            return;
        }

        setIsLoading(true);
        setLetterHtml('');

        try {
            const response = await fetch('/api/cover-letters/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobTitle,
                    companyName,
                    jobDescription,
                    tone,
                    resumeText,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setLetterHtml(data.content);
                showToast('Cover Letter generated successfully!');
            } else {
                showToast(data.error || 'Failed to generate cover letter', 'error');
            }
        } catch (error) {
            console.error('Generation error:', error);
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [jobTitle, companyName, jobDescription, tone, resumeText]);

    const handleDownload = useCallback(() => {
        const element = letterContentRef.current;
        if (!element || element.innerHTML.trim() === "") {
            showToast('There is no content to download.', 'error');
            return;
        }

        try {
            // Load jsPDF dynamically if not already loaded
            const loadJsPDF = async () => {
                if (!window.jspdf) {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                    script.async = true;
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                }
                return window.jspdf.jsPDF;
            };

            loadJsPDF().then((jsPDF) => {
                // Extract text content from HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = letterHtml;
                const textContent = tempDiv.innerText;

                // Create PDF with actual text
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'in',
                    format: 'letter'
                });

                // Set font
                doc.setFont('times', 'normal');
                doc.setFontSize(11);

                // Add text with proper wrapping
                const pageWidth = 8.5;
                const pageHeight = 11;
                const margin = 1;
                const maxLineWidth = pageWidth - (2 * margin);
                
                // Split text into lines and add to PDF
                const lines = doc.splitTextToSize(textContent, maxLineWidth);
                
                let y = margin;
                const lineHeight = 0.18; // Approximately 1.5 line spacing for 11pt font
                
                lines.forEach((line, index) => {
                    // Check if we need a new page
                    if (y + lineHeight > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    
                    doc.text(line, margin, y);
                    y += lineHeight;
                });

                // Save the PDF
                doc.save(`Cover_Letter_${companyName || 'Document'}.pdf`);
                showToast('PDF downloaded successfully!');
            }).catch((error) => {
                console.error('PDF generation error:', error);
                showToast('Failed to generate PDF. Please try again.', 'error');
            });
        } catch (error) {
            console.error('Download error:', error);
            showToast('Failed to download PDF. Please try again.', 'error');
        }
    }, [companyName, letterHtml]);

    const handleSave = useCallback(async () => {
        if (!letterHtml) {
            showToast('There is no content to save.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/cover-letters/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobTitle,
                    companyName,
                    jobDescription,
                    content: letterContentRef.current.innerHTML,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Cover letter saved successfully!');
            } else {
                showToast(data.error || 'Failed to save cover letter', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            showToast('Network error. Please try again.', 'error');
        }
    }, [jobTitle, companyName, jobDescription, letterHtml]);

// --- Render ---
    return (
        <div className="bg-[#0A0A0A] text-[#FAFAFA] min-h-screen p-4 md:p-8 font-sans">
            
            {/* --- Toast --- */}
            <div
                className={`fixed bottom-5 right-5 z-50 rounded-lg p-4 font-medium shadow-lg transition-all
                            ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                            ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-[#FAFAFA] text-[#0A0A0A]'}`}
            >
                {toast.message}
            </div>

            {!letterHtml ? (
                // Show form when no letter is generated
                <div className="max-w-2xl mx-auto space-y-6">
                    <h1 className="text-3xl font-bold text-white">AI Cover Letter Generator</h1>
                    <p className="text-base text-[#A3A3A3]">
                        Upload your resume, provide job details, and let our AI generate a personalized cover letter.
                    </p>

                    <div className="space-y-5">{/* 1. Resume Upload */}
                        <div>
                            <Label>Upload Resume (PDF or DOCX)</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#262626]
                                            rounded-lg cursor-pointer transition-colors
                                            ${isDragOver ? 'border-[#FAFAFA] bg-[#262626]' : 'hover:bg-[#0A0A0A]'}`}
                            >
                                <Upload className="w-10 h-10 text-[#A3A3A3]" />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf,.docx"
                                />
                                <p className="mt-2 text-sm text-[#A3A3A3]">
                                    {fileName ? fileName : (libsLoaded ? 'Click to upload or drag and drop' : 'Loading document tools...')}
                                </p>
                                <p className="text-xs text-[#A3A3A3]/70">PDF or DOCX (MAX. 10MB)</p>
                            </div>
                        </div>

                        {/* 2. Job Title */}
                        <div>
                            <Label htmlFor="job-title">Job Title</Label>
                            <Input
                                id="job-title"
                                placeholder="e.g., Senior Software Engineer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>

                        {/* 3. Company Name */}
                        <div>
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input
                                id="company-name"
                                placeholder="e.g., Google"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>

                        {/* 4. Job Description */}
                        <div>
                            <Label htmlFor="job-description">Job Description</Label>
                            <Textarea
                                id="job-description"
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        {/* 5. Tone */}
                        <div>
                            <Label htmlFor="tone">Tone of Voice</Label>
                            <Select
                                id="tone"
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                            >
                                <option value="Professional">Professional</option>
                                <option value="Friendly">Friendly</option>
                                <option value="Confident">Confident</option>
                            </Select>
                        </div>

                    {/* Action Button */}
                    <div className="flex justify-start pt-4">
                        <Button
                            variant="primary"
                            onClick={handleGenerate}
                            disabled={isLoading || !libsLoaded}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {isLoading ? 'Generating...' : 'Generate Letter'}
                        </Button>
                    </div>
                </div>
            </div>
            ) : (
                // Show only letter after generation
                <div className="max-w-[8.5in] mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-white">Your Cover Letter</h1>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setLetterHtml('');
                                    setResumeText('');
                                    setFileName('');
                                    setJobTitle('');
                                    setCompanyName('');
                                    setJobDescription('');
                                }}
                            >
                                Generate New
                            </Button>
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                Download as PDF
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                <Save className="mr-2 h-4 w-4" />
                                Save Letter
                            </Button>
                        </div>
                    </div>

                    <style>{`
                        .letter-editor[data-placeholder]:empty:before {
                            content: attr(data-placeholder);
                            color: #999;
                            font-style: italic;
                            cursor: text;
                        }
                    `}</style>
                    <div
                        ref={letterContentRef}
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        className="letter-editor bg-white text-black rounded-lg shadow-lg
                                   w-full min-h-[11in] p-[1in] font-serif text-base
                                   focus:outline-none focus:ring-2 focus:ring-[#FAFAFA]"
                        dangerouslySetInnerHTML={{ __html: letterHtml }}
                    >
                    </div>
                </div>
            )}
        </div>
    );
}
