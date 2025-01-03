import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Amplify } from 'aws-amplify';
import outputs from "../amplify_outputs.json";
import { predictions } from '@aws-amplify/predictions/predictions';

// Configure Amplify with strong typing
Amplify.configure({
  ...outputs,
  Predictions: {
    region: 'us-east-1', // replace with your region
    providers: {
      TextIdentification: {
        provider: 'AWSTextract',
        fallback: false
      },
      TextInterpretation: {
        provider: 'AWSComprehend',
        fallback: false
      }
    }
  }
});

// Configure predictions
predictions.configure({
  region: 'us-east-1', // replace with your region
  providers: {
    TextIdentification: {
      provider: 'AWSTextract',
      fallback: false
    },
    TextInterpretation: {
      provider: 'AWSComprehend',
      fallback: false
    }
  }
});

const rootElement = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);