import { FC } from "react";
import AppBar from "../../components/AppBar/AppBar";
import FilesAppLayout from "../../components/FilesAppLayout/FilesAppLayout";
import "@cloudscape-design/global-styles/index.css";
import { defaultBreadcrumbs } from "../../components/breadcrumbs-items";
import TableListFiles from "../../components/TableListFiles/TableListFiles";
import UploadFileCard from "../../components/UploadFileCard/UploadFileCard";
import { SpaceBetween } from "@cloudscape-design/components";

type StorageAccessLevel = 'guest' | 'private' | 'protected';

interface MainProps {
  level: StorageAccessLevel;
}

const Main: FC<MainProps> = ({ level }) => {
  return (
    <div>
      <AppBar />
      <FilesAppLayout
        breadcrumbs={defaultBreadcrumbs}
        title={`${level.charAt(0).toUpperCase() + level.slice(1)} Files`}
      >
        <SpaceBetween size="l">
          <UploadFileCard level={level} />
          <TableListFiles level={level} />
        </SpaceBetween>
      </FilesAppLayout>
    </div>
  );
};

export default Main;