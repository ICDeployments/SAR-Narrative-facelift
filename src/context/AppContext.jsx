import React, { createContext, useReducer, useContext } from "react";

const initialState = {
  messages: [],
  narrative: "",
  isProcessing: false,
  fileName: null,
  error: null,
  success: false,
  statusMessage: "",
  progress: 0,
  finished: false,
  selectedAgent: "dashboard", // Default agent
  activeHeading: "Dashboard Overview",
  narratives: {},
  generateSAR: false,
  // narratives: {
  //   preprocessor: "",
  //   sarNarrative: "",
  //   evaluator: "",
  //   formatter: "",
  // },

  // activeTab: "preprocessor" | "sarNarrative" | "evaluator" | "formatter",
  activeTab: "dashboard",
  activeResponseTab: "preprocessor",
};

const AppContext = createContext(undefined);

const appReducer = (state, action) => {
  switch (action.type) {
    case "START_PROCESSING":
      return {
        ...state,
        isProcessing: true,
        fileName: action.payload.fileName,
        messages: [],
        narrative: "",
        error: null,
        success: false,
        firstPageSuccess: false,
        currentStep: 0,
        selectedAgent: "preprocessor",
        // selectedAgent: "dashboard"
      };

      case "END_PRE_PROCESSING":
        return{
          ...state,
          success: true,
        };

         case "FIRST_PAGE_SUCCESS":
        return{
          ...state,
          firstPageSuccess: true,
        };


    case "ADD_MESSAGE":
      const newMessages = [...state.messages, action.payload];
      return {
        ...state,
        messages: newMessages.slice(-1),
      };
    case "SET_NARRATIVE":
      return {
        ...state,
        narrative: action.payload,
        // isProcessing: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        // isProcessing: false,
        success: false,
      };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        isProcessing: false,
        success: true,
        error: null,
      };
    case "RESET":
      return { ...initialState, currentStep: 0 };

    case "SET_STATUS_MESSAGE":
      return {
        ...state,
        statusMessage: action.payload,
      };

    // case "SET_PROGRESS": // discontinued
    //   return {
    //     ...state,
    //     progress: action.payload, // Update progress state
    //   };

    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: action.payload, // Update current step state
      };

    case "SET_FINISHED":
      return {
        ...state,
        finished: action.payload, // Update finished state
      };

    case "SET_COMPLETED_STEP":
      return {
        ...state,
        completedStep: action.payload, // Update current step state
      };

    case "SET_SELECTED_AGENT":
      return {
        ...state,
        selectedAgent: action.payload, // Update selected agent
      };

    case "SET_ACTIVE_HEADING":
      return {
        ...state,
        activeHeading: action.payload, // Update active heading
      };

    case "SET_NARRATIVE_FOR_STEP":
      return {
        ...state,
        narratives: {
          ...state.narratives,
          [action.payload.step]: action.payload.text,
        },
      };

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
      };

    case "SET_ACTIVE_RESPONSE_TAB":
      return {
        ...state,
        activeResponseTab: action.payload,
      };
     
    case "UPDATE_NARRATIVE":
      return {
        ...state,
        narratives: {
          ...state.narratives,
        [action.payload.tab]: action.payload.text,
      }}; 

       case "GENERATE_SAR_TOGGLE":  //On generateSAR button click
        return{
          ...state,
          // generateSAR: true,
          generateSAR: action.payload,
        };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined)
    throw new Error("useAppContext must be used within an AppProvider");
  return context;
};
