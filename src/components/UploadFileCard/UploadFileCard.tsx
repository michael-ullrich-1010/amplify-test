import { FC, ChangeEvent, useState } from "react";
import "@cloudscape-design/global-styles/index.css";
import {
    Button,
    Container,
    ExpandableSection,
    Form,
    FormField,
    Grid,
    Header,
    Input,
    PieChart,
    ProgressBar,
    SpaceBetween,
    Table,
    TokenGroup,
} from "@cloudscape-design/components";
// New v6 imports should be:
import { Amplify } from 'aws-amplify';
import { uploadData } from '@aws-amplify/storage';
import { 
    AmazonAIPredictionsProvider,
    identifyText,
    interpretText 
} from '@aws-amplify/predictions';

type StorageAccessLevel = 'guest' | 'private' | 'protected';

interface UploadFileCardProps {
    level: StorageAccessLevel; // Updated from 'private' | 'public'
}

interface IdentifyResponse {
    text: {
        fullText: string;
        keyValues: Array<{ key: string; value: string }>;
        lines: string[];
        selections?: any[];
        tables?: any[];
        words: any[];
    };
}

interface InterpretResponse {
    textInterpretation: {
        sentiment: {
            mixed: number;
            negative: number;
            neutral: number;
            positive: number;
        };
        textEntities: Array<{
            type: string;
            text: string;
        }>;
    };
}

interface TokenGroupItem {
    label: string;
    dismissLabel?: string;
}

interface TableItem {
    type: string;
    text: string;
}

const UploadFileCard: FC<UploadFileCardProps> = ({ level }) => {
    const [filename, setFilename] = useState<string>();
    const [progress, setProgress] = useState<number>();
    const [uploaded, setUploaded] = useState<boolean>(false);
    
    const [identify, setIdentify] = useState<IdentifyResponse>();
    const [interpret, setInterpret] = useState<InterpretResponse>();
    const [identifyErr, setIdentifyErr] = useState<{
        header: string;
        type: string;
        content: string;
        id: string;
    } | null>(null);
    const [keyValueTokenGroup, setKeyValueTokenGroup] = useState<TokenGroupItem[]>();
    const [firstLinesTokenGroup, setFirstLinesTokenGroup] = useState<TokenGroupItem[]>();

    const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setProgress(0);
        const file = e.target.files?.[0];
        if (!file) return;
    
        setFilename(file.name);
    
        try {
            await uploadData({
                key: file.name,
                data: file,
                options: {
                    accessLevel: level as StorageAccessLevel,
                    onProgress(progress) {
                        const { transferredBytes, totalBytes } = progress;
                        if (totalBytes) {  // Add null check for totalBytes
                            setProgress((transferredBytes * 100) / totalBytes);
                        }
                    }
                }
            }).result;
            
            setUploaded(true);
    
            const responseIdentify = await onIdentify(file);
            if (responseIdentify) {
                await onInterpret(responseIdentify.text.fullText);
            }
        } catch (error) {
            console.log("Error uploading file: ", error);
        }
    };
    
    const onIdentify = async (file: File): Promise<IdentifyResponse | null> => {
        try {
            const respPrediction = await identifyText({
                text: {
                    source: {
                        file
                    }
                }
            }) as IdentifyResponse;
    
            setIdentify(respPrediction);
    
            const keyValuesGroupArray = respPrediction.text.keyValues.map(each => ({
                label: each.key
            }));
    
            const firstLinesGroupArray = respPrediction.text.lines
                .slice(0, Math.min(5, respPrediction.text.lines.length))
                .map((line, i) => ({
                    label: `Line ${i}: ${line}`
                }));
    
            setKeyValueTokenGroup(keyValuesGroupArray);
            setFirstLinesTokenGroup(firstLinesGroupArray);
            setIdentifyErr(null);
    
            return respPrediction;
        } catch (error) {
            console.log("Error uploading file: ", error);
            setIdentify(undefined);
            setKeyValueTokenGroup(undefined);
            setFirstLinesTokenGroup(undefined);
            setIdentifyErr({
                header: "Text identification data error - No valid data",
                type: "error",
                content: "This function only works for PDF files.",
                id: "message_error"
            });
            return null;
        }
    };
    
    const onInterpret = async (fullText: string) => {
        try {
            const respPredictions = await interpretText({
                text: {
                    source: {
                        text: fullText,
                    },
                    type: "ALL"
                }
            }) as InterpretResponse;
    
            setInterpret(respPredictions);
        } catch (e) {
            console.log(e);
        }
    };

    const retrieveItems = (): TableItem[] => {
        if (!interpret) return [];

        const aMap: Record<string, string[]> = {};

        interpret.textInterpretation.textEntities.forEach((each) => {
            aMap[each.type] = aMap[each.type] || [];
            aMap[each.type].push(each.text);
        });

        return Object.entries(aMap).map(([type, texts]) => ({
            type,
            text: texts.join(', ')
        }));
    };

    return (
        <Container>
            <SpaceBetween size="l">
                <ProgressBar
                    value={progress}
                    label={filename === undefined ? "Click in the button to upload a file" : `Uploading file ${filename}`}
                />

                <div>
                    <input
                        accept="*/*"
                        id="icon-button-file"
                        type="file"
                        onChange={onChange}
                        style={{ display: "none" }}
                    />
                    <Button>
                        <label htmlFor="icon-button-file">
                            Upload new file
                        </label>
                    </Button>
                </div>

                {identify && (
                    <ExpandableSection headerText="Identify text (available only for documents)">
                        <Form>
                            <Grid
                                gridDefinition={[
                                    { colspan: 2 }, { colspan: 2 }, { colspan: 2 },
                                    { colspan: 2 }, { colspan: 2 }, { colspan: 12 },
                                    { colspan: 12 }, { colspan: 12 }, { colspan: 12 },
                                    { colspan: 12 }, { colspan: 12 }, { colspan: 12 },
                                    { colspan: 12 }
                                ]}
                            >
                                <FormField label="Key values">
                                    <Input
                                        disabled
                                        value={identify.text.keyValues.length.toString()}
                                    />
                                </FormField>
                                <FormField label="Lines">
                                    <Input
                                        disabled
                                        value={identify.text.lines.length.toString()}
                                    />
                                </FormField>
                                <FormField label="Selections">
                                    <Input
                                        disabled
                                        value={identify.text.selections?.length.toString() || ""}
                                    />
                                </FormField>
                                <FormField label="Tables">
                                    <Input
                                        disabled
                                        value={identify.text.tables?.length.toString() || ""}
                                    />
                                </FormField>
                                <FormField label="Words">
                                    <Input
                                        disabled
                                        value={identify.text.words.length.toString()}
                                    />
                                </FormField>

                                <Header variant="h3">Key Values found</Header>
                                <TokenGroup items={keyValueTokenGroup || []} />

                                <Header variant="h3">First lines found</Header>
                                <TokenGroup items={firstLinesTokenGroup || []} />

                                {interpret && (
                                    <>
                                        <Header variant="h3">Sentiment</Header>
                                        <PieChart
                                            data={[
                                                {
                                                    title: "Mixed",
                                                    value: interpret.textInterpretation.sentiment.mixed * 100,
                                                },
                                                {
                                                    title: "Negative",
                                                    value: interpret.textInterpretation.sentiment.negative * 100,
                                                },
                                                {
                                                    title: "Neutral",
                                                    value: interpret.textInterpretation.sentiment.neutral * 100,
                                                },
                                                {
                                                    title: "Positive",
                                                    value: interpret.textInterpretation.sentiment.positive * 100,
                                                }
                                            ]}
                                            hideFilter
                                            detailPopoverContent={(datum, sum) => [
                                                { key: "Value", value: datum.value },
                                                {
                                                    key: "Percentage",
                                                    value: `${datum.value.toFixed(2)} %`
                                                },
                                            ]}
                                        />

                                        <Table
                                            columnDefinitions={[
                                                {
                                                    id: "type",
                                                    header: "Type",
                                                    cell: item => item.type || "-"
                                                },
                                                {
                                                    id: "text",
                                                    header: "Labels found",
                                                    cell: item => item.text || "-"
                                                },
                                            ]}
                                            items={retrieveItems()}
                                            loadingText="Loading resources"
                                            sortingDisabled
                                            variant="embedded"
                                        />
                                    </>
                                )}
                            </Grid>
                        </Form>
                    </ExpandableSection>
                )}
            </SpaceBetween>
        </Container>
    );
};

export default UploadFileCard;