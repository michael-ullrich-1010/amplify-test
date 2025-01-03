import { FC, ReactNode } from "react";
import Header from "@cloudscape-design/components/header";
import { AppLayout, BreadcrumbGroup, ContentLayout } from "@cloudscape-design/components";
import { BreadcrumbGroupProps } from "@cloudscape-design/components/breadcrumb-group";

interface FilesAppLayoutProps {
  breadcrumbs: BreadcrumbGroupProps.Item[];
  title: string;
  children: ReactNode;
}

const FilesAppLayout: FC<FilesAppLayoutProps> = ({ breadcrumbs, title, children }) => {
  return (
    <AppLayout
      toolsHide={true}
      navigationHide={true}
      breadcrumbs={<BreadcrumbGroup items={breadcrumbs} />}
      content={
        <ContentLayout
          header={
            <Header variant="h1">
              {title}
            </Header>
          }
        >
          {children}
        </ContentLayout>
      }
    />
  );
};

export default FilesAppLayout;