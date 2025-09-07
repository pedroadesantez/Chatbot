'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { ConversationExporter, ExportOptions } from '@/lib/export';
import { 
  Download, 
  Copy, 
  FileText, 
  FileJson, 
  FileCode, 
  Sheet, 
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface ExportDialogProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ messages, isOpen, onClose }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('text');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSystemMessages, setIncludeSystemMessages] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const exportOptions: ExportOptions = {
    format: selectedFormat,
    includeTimestamps,
    includeSystemMessages,
  };

  const formats = [
    { 
      value: 'text' as const, 
      label: 'Plain Text', 
      icon: FileText,
      description: 'Simple text format, easy to read'
    },
    { 
      value: 'markdown' as const, 
      label: 'Markdown', 
      icon: FileCode,
      description: 'Formatted text with styling'
    },
    { 
      value: 'json' as const, 
      label: 'JSON', 
      icon: FileJson,
      description: 'Structured data format'
    },
    { 
      value: 'csv' as const, 
      label: 'CSV', 
      icon: Sheet,
      description: 'Spreadsheet-compatible format'
    },
  ];

  const handleDownload = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      const validation = ConversationExporter.validateForExport(messages);
      
      if (!validation.valid) {
        setErrorMessage(validation.issues.join(', '));
        setExportStatus('error');
        return;
      }

      ConversationExporter.downloadAsFile(messages, exportOptions);
      setExportStatus('success');
      
      // Auto-close after successful download
      setTimeout(() => {
        onClose();
        setExportStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to export conversation');
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      const validation = ConversationExporter.validateForExport(messages);
      
      if (!validation.valid) {
        setErrorMessage(validation.issues.join(', '));
        setExportStatus('error');
        return;
      }

      await ConversationExporter.copyToClipboard(messages, exportOptions);
      setExportStatus('success');

      // Reset status after showing success
      setTimeout(() => {
        setExportStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Copy error:', error);
      setErrorMessage('Failed to copy to clipboard');
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const summary = ConversationExporter.generateSummary(messages);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Export Conversation</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Conversation Summary */}
          <div className="bg-muted/50 rounded-md p-3 text-sm">
            <h3 className="font-medium mb-2">Summary</h3>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {summary}
            </pre>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              {formats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`p-3 rounded-md border text-left transition-colors ${
                      selectedFormat === format.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{format.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Options</label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeTimestamps}
                onChange={(e) => setIncludeTimestamps(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Include timestamps</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeSystemMessages}
                onChange={(e) => setIncludeSystemMessages(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Include system messages</span>
            </label>
          </div>

          {/* Status Messages */}
          {exportStatus === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
              <Check className="w-4 h-4" />
              <span>Export successful!</span>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleDownload}
              disabled={isExporting || messages.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Download'}
            </button>

            <button
              onClick={handleCopy}
              disabled={isExporting || messages.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}