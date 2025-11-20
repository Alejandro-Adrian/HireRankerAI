"use client"

import { useState } from "react"
import { Upload, FileText, ImageIcon, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ParseResult {
  success: boolean
  method?: string
  data?: any
  error?: string
  parseTime?: number
}

export default function AIParserTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState<{ [key: string]: boolean }>({})
  const [results, setResults] = useState<{ [key: string]: ParseResult }>({})
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setResults({})
      addLog(`Selected file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
    }
  }

  const parseDocument = async (method: 'ocr' | 'ai' | 'hybrid' | 'direct' | 'simple') => {
    if (!selectedFile) {
      addLog("No file selected")
      return
    }

    setParsing((prev) => ({ ...prev, [method]: true }))
    addLog(`Starting ${method.toUpperCase()} parsing...`)
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append("resume", selectedFile)

      const endpoint = `/api/test-parse-${method}`
      addLog(`Uploading to ${endpoint}...`)
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const parseTime = Date.now() - startTime
      addLog(`${method.toUpperCase()} completed in ${(parseTime / 1000).toFixed(2)}s`)

      const data = await response.json()

      if (response.ok) {
        setResults((prev) => ({
          ...prev,
          [method]: {
            success: true,
            method: data.method,
            data: data.data,
            parseTime: data.parseTime,
          },
        }))
        addLog(`${method.toUpperCase()} parse successful!`)
      } else {
        setResults((prev) => ({
          ...prev,
          [method]: {
            success: false,
            error: data.error || "Failed to parse document",
            parseTime,
          },
        }))
        addLog(`${method.toUpperCase()} failed: ${data.error}`)
      }
    } catch (error) {
      const parseTime = Date.now() - startTime
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      setResults((prev) => ({
        ...prev,
        [method]: {
          success: false,
          error: errorMsg,
          parseTime,
        },
      }))
      addLog(`${method.toUpperCase()} error: ${errorMsg}`)
    } finally {
      setParsing((prev) => ({ ...prev, [method]: false }))
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-emerald-500" />
  }

  const renderResult = (result: ParseResult | undefined, method: string) => {
    if (!result) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No results yet. Upload a file and click "Parse with {method.toUpperCase()}"</p>
        </div>
      )
    }

    if (!result.success) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">Error Details</h4>
              <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
              <p className="text-xs text-red-500 mt-2">Parse time: {((result.parseTime || 0) / 1000).toFixed(2)}s</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Method: {result.method || method.toUpperCase()}</span>
          <span>•</span>
          <span>Time: {((result.parseTime || 0) / 1000).toFixed(2)}s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Personal Information</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Name:</dt>
                <dd className="font-medium text-foreground">{result.data.applicant_name || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email:</dt>
                <dd className="font-medium text-foreground">{result.data.applicant_email || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Phone:</dt>
                <dd className="font-medium text-foreground">{result.data.applicant_phone || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">City:</dt>
                <dd className="font-medium text-foreground">{result.data.applicant_city || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Extracted Data</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Skills:</dt>
                <dd className="font-medium text-foreground">{result.data.skills?.length || 0} found</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Experience:</dt>
                <dd className="font-medium text-foreground">{result.data.experience_years || 0} years</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Education:</dt>
                <dd className="font-medium text-foreground">{result.data.education || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {result.data.skills && result.data.skills.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {result.data.skills.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold text-foreground mb-2">Full Response</h4>
          <pre className="text-xs text-muted-foreground overflow-x-auto p-2 bg-background rounded max-h-64">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Document Parser Comparison Test</h1>
          <p className="text-muted-foreground">Test and compare different parsing methods side by side</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
            <CardDescription>
              Upload a resume file to test all parsing methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-sm font-medium text-foreground mb-2 block">
                Select Resume File
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileSelect}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  {getFileIcon(selectedFile.name)}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type || 'Unknown type'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <Button
                    onClick={() => parseDocument('ocr')}
                    disabled={parsing.ocr}
                    variant="outline"
                    className="w-full"
                  >
                    {parsing.ocr ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        OCR...
                      </>
                    ) : (
                      'OCR'
                    )}
                  </Button>

                  <Button
                    onClick={() => parseDocument('ai')}
                    disabled={parsing.ai}
                    variant="outline"
                    className="w-full"
                  >
                    {parsing.ai ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        AI...
                      </>
                    ) : (
                      'AI'
                    )}
                  </Button>

                  <Button
                    onClick={() => parseDocument('hybrid')}
                    disabled={parsing.hybrid}
                    variant="outline"
                    className="w-full"
                  >
                    {parsing.hybrid ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Hybrid...
                      </>
                    ) : (
                      'Hybrid'
                    )}
                  </Button>

                  <Button
                    onClick={() => parseDocument('direct')}
                    disabled={parsing.direct}
                    variant="outline"
                    className="w-full"
                  >
                    {parsing.direct ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Direct...
                      </>
                    ) : (
                      'Direct PDF'
                    )}
                  </Button>

                  <Button
                    onClick={() => parseDocument('simple')}
                    disabled={parsing.simple}
                    variant="outline"
                    className="w-full"
                  >
                    {parsing.simple ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Simple...
                      </>
                    ) : (
                      'Simple TXT'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="ocr" className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ocr">
              OCR
              {results.ocr && (
                <span className={`ml-2 ${results.ocr.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {results.ocr.success ? '✓' : '✗'}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai">
              AI
              {results.ai && (
                <span className={`ml-2 ${results.ai.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {results.ai.success ? '✓' : '✗'}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="hybrid">
              Hybrid
              {results.hybrid && (
                <span className={`ml-2 ${results.hybrid.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {results.hybrid.success ? '✓' : '✗'}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="direct">
              Direct
              {results.direct && (
                <span className={`ml-2 ${results.direct.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {results.direct.success ? '✓' : '✗'}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="simple">
              Simple
              {results.simple && (
                <span className={`ml-2 ${results.simple.success ? 'text-emerald-500' : 'text-red-500'}`}>
                  {results.simple.success ? '✓' : '✗'}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ocr">
            <Card>
              <CardHeader>
                <CardTitle>OCR Method Results</CardTitle>
                <CardDescription>
                  Uses OCR.space API with PDF-to-image conversion for PDFs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderResult(results.ocr, 'ocr')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Method Results</CardTitle>
                <CardDescription>
                  Uses Grok AI to understand and extract information (PDFs only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderResult(results.ai, 'ai')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hybrid">
            <Card>
              <CardHeader>
                <CardTitle>Hybrid Method Results</CardTitle>
                <CardDescription>
                  PDF text extraction with regex, falls back to OCR for images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderResult(results.hybrid, 'hybrid')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle>Direct PDF Text Extraction</CardTitle>
                <CardDescription>
                  Uses pdf-parse to extract text directly from PDFs without image conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderResult(results.direct, 'direct')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simple">
            <Card>
              <CardHeader>
                <CardTitle>Simple Text Parser</CardTitle>
                <CardDescription>
                  Basic regex-based parser for TXT files only
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderResult(results.simple, 'simple')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Event Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event Logs</CardTitle>
              <Button
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
              >
                Clear Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-muted-foreground space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground/50">No logs yet. Upload and parse a document to see logs.</p>
              ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
