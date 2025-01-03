import { useEffect, useState } from "react";
import "@cloudscape-design/global-styles/index.css";
import { Box, Button, SpaceBetween, Table } from "@cloudscape-design/components";
import Header from "@cloudscape-design/components/header";
import { list, getUrl, remove } from 'aws-amplify/storage';
import type { GetUrlOutput } from 'aws-amplify/storage';

interface FileItem {
  key: string;
  size: number;
  lastModified: Date;
}

type StorageAccessLevel = 'guest' | 'private' | 'protected';

interface TableListFilesProps {
  level: StorageAccessLevel;
}

const columnDefinitions = [
  {
    id: 'key',
    cell: (item: FileItem) => item.key,
    header: 'Filename',
  },
  {
    id: 'size',
    header: 'Size',
    cell: (item: FileItem) => (item.size / 1024 / 1024).toFixed(2) + " MB",
    minWidth: 10,
  },
  {
    id: 'lastModified',
    header: 'Last Modified',
    cell: (item: FileItem) => item.lastModified.toString(),
  },
];

const TableListFiles: React.FC<TableListFilesProps> = ({ level }) => {
  const [items, setItems] = useState<FileItem[] | undefined>(undefined);
  const [selectedItems, setSelectedItems] = useState<FileItem[]>([]);

  const load = async () => {
    try {
      const result = await list({
        prefix: '',
        options: {
          accessLevel: level,
          listAll: true
        }
      });

      // Transform the results to match our FileItem interface
      const fileItems = result.items.map(item => ({
        key: item.key,
        size: item.size || 0,
        lastModified: new Date(item.lastModified || Date.now())
      }));
      
      setItems(fileItems);
    } catch (err) {
      console.error('Error listing files:', err);
    }
  };

  useEffect(() => {
    load();
  }, [level]); // Add level as dependency

  const downloadFile = async (filename: string) => {
    try {
      const result: GetUrlOutput = await getUrl({
        key: filename,
        options: {
          accessLevel: level,
          useAccelerateEndpoint: true // Optional: use S3 acceleration if configured
        }
      });
      
      if (result.url) {
        openInNewTab(result.url.toString());
      }
    } catch (err) {
      console.error('Error getting file URL:', err);
    }
  };

  const deleteFile = async (filename: string) => {
    try {
      await remove({
        key: filename,
        options: {
          accessLevel: level
        }
      });
      await load(); // Refresh the file list after deletion
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  return (
    <Table
      items={items || []}
      columnDefinitions={columnDefinitions}
      onSelectionChange={({ detail }) =>
        setSelectedItems(detail.selectedItems as FileItem[])
      }
      header={
        <Header
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <Button onClick={load}>Refresh</Button>
              <Button 
                disabled={selectedItems.length === 0} 
                onClick={() => selectedItems[0]?.key && downloadFile(selectedItems[0].key)}
              >
                Download
              </Button>
              <Button 
                disabled={selectedItems.length === 0} 
                onClick={() => selectedItems[0]?.key && deleteFile(selectedItems[0].key)}
              >
                Delete
              </Button>
            </SpaceBetween>
          }
        >
          Files List
        </Header>
      }
      selectionType="single"
      selectedItems={selectedItems}
      empty={
        <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
          <SpaceBetween size="xxs">
            <div>
              <b>No files uploaded yet</b>
              <Box variant="p" color="inherit">
                You don't have any files uploaded yet.
              </Box>
            </div>
          </SpaceBetween>
        </Box>
      }
    />
  );
};

export default TableListFiles;