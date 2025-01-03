import { FC } from "react";
import AppBar from "../../components/AppBar/AppBar";
import FilesAppLayout from "../../components/FilesAppLayout/FilesAppLayout";
import "@cloudscape-design/global-styles/index.css";

import { defaultBreadcrumbs } from "../../components/breadcrumbs-items";
import TableListFiles from "../../components/TableListFiles/TableListFiles";
import UploadFileCard from "../../components/UploadFileCard/UploadFileCard";
import { SpaceBetween } from "@cloudscape-design/components";

// Define the storage access level type
type StorageAccessLevel = 'guest' | 'private' | 'protected';

interface MainProps {
  level: StorageAccessLevel;
}

const Main: FC<MainProps> = ({ level }) => {
  return (
    <>
      <AppBar />
      <FilesAppLayout
        breadcrumbs={defaultBreadcrumbs}
        title={level === 'private' ? "My private files" : "Shared files"}
      >
        <SpaceBetween size="l">
          <UploadFileCard level={level} />
          <TableListFiles level={level} />
        </SpaceBetween>
      </FilesAppLayout>
    </>
  );
};

export default Main;