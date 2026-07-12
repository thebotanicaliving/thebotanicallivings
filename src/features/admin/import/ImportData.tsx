import { useState } from 'react';
import { Button } from '@/components/shared';
import { useToast } from '@/providers/ToastProvider';
import { db } from '@/firebase/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export function ImportData() {
  const [jsonText, setJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { showToast } = useToast();

  const handleImport = async () => {
    if (!jsonText.trim()) return showToast('Please enter JSON data', 'error');
    
    setIsImporting(true);
    setResults([]);
    
    try {
      const data = JSON.parse(jsonText);
      const newResults: string[] = [];
      
      for (const [colName, items] of Object.entries(data)) {
        if (!items || typeof items !== 'object') {
          newResults.push(`Skipped ${colName}: Invalid data type`);
          continue;
        }

        // 1. If it is an array of items
        if (Array.isArray(items)) {
          let count = 0;
          for (const item of items) {
            if (item && typeof item === 'object') {
              const { id, ...rest } = item as any;
              const docId = id || (colName === 'homepage' ? 'config' : colName === 'settings' ? 'general' : null);
              if (docId) {
                await setDoc(doc(collection(db, colName), docId), rest);
                count++;
              }
            }
          }
          newResults.push(`Imported ${count} items into collection '${colName}'`);
          continue;
        }

        // 2. It is an object. Check if it's a map of { docId: docData } or a single document itself.
        const keys = Object.keys(items);
        const isNestedDocumentMap = keys.length > 0 && keys.every(k => {
          const val = (items as any)[k];
          return typeof val === 'object' && val !== null && !Array.isArray(val);
        });

        if (isNestedDocumentMap) {
          // Case A: Map of docId -> docData (e.g., { "config": { ... } })
          let count = 0;
          for (const [docId, docData] of Object.entries(items)) {
            if (docData && typeof docData === 'object') {
              await setDoc(doc(collection(db, colName), docId), docData);
              count++;
            }
          }
          newResults.push(`Imported ${count} items into collection '${colName}'`);
        } else {
          // Case B: Direct flat object itself representing the document (e.g., { "heroTitle": "..." })
          const docId = colName === 'homepage' ? 'config' : colName === 'settings' ? 'general' : 'default';
          await setDoc(doc(collection(db, colName), docId), items);
          newResults.push(`Imported single document into collection '${colName}' with ID '${docId}'`);
        }
      }
      
      setResults(newResults);
      showToast('Import completed', 'success');
      setJsonText('');
    } catch (e: any) {
      showToast('Import failed: ' + e.message, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Import Data</h1>
      <div className="bg-white p-6 rounded-card shadow space-y-4">
        <p className="text-sm text-stone-600 mb-4">
          Paste your JSON data below. The format should be an object where keys are collection names (e.g. "rooms", "faq") and values are arrays of objects. Each object must have an "id" field.
        </p>
        <textarea
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          className="w-full h-96 p-4 border rounded font-mono text-xs"
          placeholder={'{\n  "rooms": [\n    { "id": "room-1", "title": "..." }\n  ]\n}'}
        />
        <div className="flex justify-end">
          <Button onClick={handleImport} disabled={isImporting || !jsonText.trim()}>
            {isImporting ? 'Importing...' : 'Run Import'}
          </Button>
        </div>
        
        {results.length > 0 && (
          <div className="mt-8 p-4 bg-stone-50 border rounded">
            <h3 className="font-bold mb-2">Import Results</h3>
            <ul className="list-disc pl-5 text-sm space-y-1 text-stone-700">
              {results.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
