import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";

// --- CONFIG ---
const ASKMANTU_BASE_URL =
  process.env.ASKMANTU_BASE_URL || "https://oauth1.askmantu.com/vedi";
const ASKMANTU_API_KEY = process.env.ASKMANTU_API_KEY; // required
const USER_NAME = process.env.ASKMANTU_USER_NAME || "rachit";

// Fixed payload pieces from your cURLs
const EMBEDDING_MODEL = "baai/bge-small-en-v1.5";
const CHUNK_SIZE = "500";
const CHUNK_OVERLAP = "100";

const WORKFLOW_FIXED = {
  chatbot_description: "Testing Bot",
  chatbot_introduction_message: "Hello",
  chatbot_placeholder_message: "Hello",
  model_name: "groq",
  system_prompt: "You are a AI",
  context_prompt:
    "Here is some context that may be relevant:\n-----\n{node_context}\n-----\nPlease write a response to the following question, using the above context:\n{query_str}\n",
  similarity_distance: 0.6,
  top_k: 6,
  recent_conversation_rounds: 5,
  rewrite_query: true,
  rewrite_prompt:
    "Please write a query to a semantic search engine using the current conversation.\n\n\n{chat_history_str}\n\nLatest message: {query_str}\nQuery:",
};

// Parameters from your “Design Peramters.docx”
const DESIGN_PARAMETERS = [
  // General
  //   "Project Location",
  //   "Building Type",
  //   "List of Floors",
  //   "List of Rooms on each floor",
  //   "Area of Rooms",
  //   "Building type as per Fire norms",
  //   "Occupancy Room wise",
  // Electrical
  //   "Room wise Lux level",
  //   "Room wise Type of Light Fixture",
  //   "Room wise Light Load",
  //   "Room wise Power Load",
  //   "Emergency lighting load",
  //   "Type of DG, UPS and Cables to be use in the project",
  //   "Cable material: Copper or Aluminum or both",
  //   "List of Rooms UPS required",
  // HVAC
  //   "Outdoor Temperature (Summer and Monsoon) (DB, WB and Humidity)",
  //   "AC System: VRV or Chilled water system",
  //   "List of areas AC required",
  //   "List of areas Ventilation required",
  //   "Ventilation: Min air changes room wise",
  //   "Internal Room wise temperature",
  //   "Technical specification of Chiller, AHU, Condenser and Pump",
  //   "Duct type and Gauge",
  //   "Basement Ventilation: Natural or Mechanical",
  //   "Staircase Pressurization",
  // Plumbing
  //   "Area wise water demand",
  //   "Occupancy Criteria",
  //   "AC hours of operation",
  //   "Source of water: Municipality or tanker or Borewell or all",
  //   "Water supply Method: Gravity or Hydro pneumatic",
  //   "Requirement of STP",
  //   "Types of water treatment equipments",
  //   "Pipe material",
  //   "Maximum velocity of flow",
  //   "Rainfall intensity",
  // Fire Fighting
  //   "Type of FHC: Single reel or Double reel",
  //   "Sprinkler Requirement",
  //   "Fire Pumps and Capacities",
  //   "Jockey Pump Capacity",
  "Give me the type of the building",
  "Give me the list of floors",
  "Give me the list of rooms on each floor",
  "Give me the area of rooms",
  "Give me the room wise lux level",
  "Give me the room wise type of light fixture",
  "List areasfor UPS supply",
  "List areas for ventilation",
  "Which AC system is used",
  "Which water supply method is used",
];

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * POST /api/design-bot/process
 * multipart/form-data with field "pdf"
 */
// export default async function vediProcessing(req, res) {
//   if (!ASKMANTU_API_KEY) {
//     return res.status(500).json({ error: "Missing ASKMANTU_API_KEY env var" });
//   }

//   const file = req.file; // set by multer
//   if (!file) {
//     return res
//       .status(400)
//       .json({ error: "No PDF uploaded under field 'pdf'." });
//   }
//   if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
//     fs.unlink(file.path, () => {});
//     return res.status(400).json({ error: "Only .pdf files are accepted." });
//   }

//   const kbName = `DesignDrafterKB_${Date.now()}_${uuidv4().slice(0, 8)}`;
//   const headersAuth = { Authorization: `Bearer ${ASKMANTU_API_KEY}` };

//   const stepStatus = {
//     knowledge_base_name: kbName,
//     create_knowledge_base: null,
//     create_workflow_app: null,
//     get_workflow_app: null,
//     chat: [],
//   };

//   try {
//     // 2) create_knowledge_base
//     const fd = new FormData();
//     fd.append("embedding_model", EMBEDDING_MODEL);
//     fd.append("knowledge_base_name", kbName);
//     fd.append("user_name", USER_NAME);
//     fd.append("files", fs.createReadStream(file.path), file.originalname);
//     fd.append("chunk_size", CHUNK_SIZE);
//     fd.append("chunk_overlap", CHUNK_OVERLAP);

//     const kbResp = await axios.post(
//       `${ASKMANTU_BASE_URL}/create_knowledge_base`,
//       fd,
//       {
//         headers: {
//           ...fd.getHeaders(),
//           ...headersAuth,
//           Accept: "application/json",
//         },
//         timeout: 10 * 60 * 1000, // 10 mins for large PDFs
//         maxContentLength: Infinity,
//         maxBodyLength: Infinity,
//       }
//     );

//     stepStatus.create_knowledge_base = {
//       status: kbResp.status,
//       data: kbResp.data,
//     };
//     if (kbResp.status !== 200) {
//       throw new Error(
//         `create_knowledge_base failed with status ${kbResp.status}`
//       );
//     }

//     // 4) create_workflow_app (chatbot_name = kbName; knowledge_base_name = kbName)
//     const wfBody = {
//       user_name: USER_NAME,
//       chatbot_name: kbName,
//       knowledge_base_name: kbName,
//       ...WORKFLOW_FIXED,
//     };

//     const wfResp = await axios.post(
//       `${ASKMANTU_BASE_URL}/create_workflow_app`,
//       wfBody,
//       {
//         headers: { "Content-Type": "application/json", ...headersAuth },
//         timeout: 60 * 1000,
//       }
//     );

//     stepStatus.create_workflow_app = {
//       status: wfResp.status,
//       data: wfResp.data,
//     };
//     if (wfResp.status !== 200) {
//       throw new Error(
//         `create_workflow_app failed with status ${wfResp.status}`
//       );
//     }

//     // 6) get_workflow_app
//     const getResp = await axios.post(
//       `${ASKMANTU_BASE_URL}/get_workflow_app`,
//       { user_name: USER_NAME, chatbot_name: kbName },
//       {
//         headers: { "Content-Type": "application/json", ...headersAuth },
//         timeout: 60 * 1000,
//       }
//     );

//     stepStatus.get_workflow_app = {
//       status: getResp.status,
//       data: getResp.data,
//     };
//     if (getResp.status !== 200) {
//       throw new Error(`get_workflow_app failed with status ${getResp.status}`);
//     }

//     // 8) & 9) chat every 10s for each parameter
//     const results = [];
//     for (let i = 0; i < DESIGN_PARAMETERS.length; i++) {
//       const parameter = DESIGN_PARAMETERS[i];
//       // wait 10s between calls, but skip the very first one
//       if (i > 0) await sleep(10_000);

//       const query = `give in one word the ${parameter} according to the pdf uploaded`;

//       try {
//         const chatResp = await axios.post(
//           `${ASKMANTU_BASE_URL}/chat`,
//           {
//             user_name: USER_NAME,
//             chatbot_name: kbName,
//             query,
//           },
//           {
//             headers: { "Content-Type": "application/json", ...headersAuth },
//             timeout: 120 * 1000,
//           }
//         );

//         // Try a few common response keys; fall back to raw data
//         const answer =
//           chatResp?.data?.answer ??
//           chatResp?.data?.message ??
//           chatResp?.data?.response ??
//           chatResp?.data;

//         const item = {
//           parameter,
//           query,
//           status: chatResp.status,
//           answer,
//           raw: chatResp.data,
//         };
//         results.push(item);
//         stepStatus.chat.push(item);
//       } catch (err) {
//         const fail = {
//           parameter,
//           query,
//           status: err.response?.status ?? 500,
//           error: err.response?.data ?? err.message,
//         };
//         results.push(fail);
//         stepStatus.chat.push(fail);
//       }
//     }

//     // Final response
//     return res.json({
//       success: true,
//       knowledge_base_name: kbName,
//       chatbot_name: kbName,
//       steps: {
//         create_knowledge_base: stepStatus.create_knowledge_base.status,
//         create_workflow_app: stepStatus.create_workflow_app.status,
//         get_workflow_app: stepStatus.get_workflow_app.status,
//       },
//       results, // array of per-parameter answers
//     });
//   } catch (err) {
//     // Bubble up the first failing step
//     const status = err.response?.status ?? 500;
//     const data = err.response?.data ?? { message: err.message };
//     return res.status(status).json({ success: false, error: data, stepStatus });
//   } finally {
//     // clean uploaded temp file
//     fs.unlink(file.path, () => {});
//   }
// }

export default async function vediProcessing(req, res) {
  if (!ASKMANTU_API_KEY) {
    console.error("[ERROR] Missing ASKMANTU_API_KEY env var");
    return res.status(500).json({ error: "Missing ASKMANTU_API_KEY env var" });
  }

  const file = req.file; // set by multer
  if (!file) {
    console.warn("[WARN] No PDF uploaded under field 'pdf'");
    return res
      .status(400)
      .json({ error: "No PDF uploaded under field 'pdf'." });
  }
  if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
    fs.unlink(file.path, () => {});
    console.warn("[WARN] Uploaded file is not a PDF");
    return res.status(400).json({ error: "Only .pdf files are accepted." });
  }

  const kbName = `DesignDrafterKB_${Date.now()}_${uuidv4().slice(0, 8)}`;
  console.log(`[STEP] Generated knowledge_base_name: ${kbName}`);

  const headersAuth = { Authorization: `Bearer ${ASKMANTU_API_KEY}` };

  const stepStatus = {
    knowledge_base_name: kbName,
    create_knowledge_base: null,
    create_workflow_app: null,
    get_workflow_app: null,
    chat: [],
  };

  try {
    // 2) create_knowledge_base
    console.log("[STEP] Calling create_knowledge_base...");
    const fd = new FormData();
    fd.append("embedding_model", EMBEDDING_MODEL);
    fd.append("knowledge_base_name", kbName);
    fd.append("user_name", USER_NAME);
    fd.append("files", fs.createReadStream(file.path), file.originalname);
    fd.append("chunk_size", CHUNK_SIZE);
    fd.append("chunk_overlap", CHUNK_OVERLAP);

    const kbResp = await axios.post(
      `${ASKMANTU_BASE_URL}/create_knowledge_base`,
      fd,
      {
        headers: {
          ...fd.getHeaders(),
          ...headersAuth,
          Accept: "application/json",
        },
        timeout: 10 * 60 * 1000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log(`[SUCCESS] create_knowledge_base: ${kbResp.status}`);
    stepStatus.create_knowledge_base = {
      status: kbResp.status,
      data: kbResp.data,
    };

    // 4) create_workflow_app
    console.log("[STEP] Calling create_workflow_app...");
    const wfBody = {
      user_name: USER_NAME,
      chatbot_name: kbName,
      knowledge_base_name: kbName,
      ...WORKFLOW_FIXED,
    };

    const wfResp = await axios.post(
      `${ASKMANTU_BASE_URL}/create_workflow_app`,
      wfBody,
      {
        headers: { "Content-Type": "application/json", ...headersAuth },
        timeout: 60 * 1000,
      }
    );

    console.log(`[SUCCESS] create_workflow_app: ${wfResp.status}`);
    stepStatus.create_workflow_app = {
      status: wfResp.status,
      data: wfResp.data,
    };

    // 6) get_workflow_app
    console.log("[STEP] Calling get_workflow_app...");
    const getResp = await axios.post(
      `${ASKMANTU_BASE_URL}/get_workflow_app`,
      { user_name: USER_NAME, chatbot_name: kbName },
      {
        headers: { "Content-Type": "application/json", ...headersAuth },
        timeout: 60 * 1000,
      }
    );

    console.log(`[SUCCESS] get_workflow_app: ${getResp.status}`);
    stepStatus.get_workflow_app = {
      status: getResp.status,
      data: getResp.data,
    };

    // 8) & 9) chat loop
    console.log("[STEP] Starting chat loop over parameters...");
    const results = [];
    for (let i = 0; i < DESIGN_PARAMETERS.length; i++) {
      const parameter = DESIGN_PARAMETERS[i];
      if (i > 0) {
        console.log(`[WAIT] Sleeping 20s before next chat...`);
        await sleep(10_000);
      }

      const query = parameter;
      console.log(`[CHAT] Querying parameter: ${parameter}`);

      try {
        const chatResp = await axios.post(
          `${ASKMANTU_BASE_URL}/chat`,
          {
            user_name: USER_NAME,
            chatbot_name: kbName,
            query,
          },
          {
            headers: { "Content-Type": "application/json", ...headersAuth },
            timeout: 120 * 2000,
          }
        );

        const answer =
          chatResp?.data?.answer ??
          chatResp?.data?.message ??
          chatResp?.data?.response ??
          chatResp?.data;

        console.log(
          `[SUCCESS] Chat for ${parameter}: status ${chatResp.status}, answer -> ${answer}`
        );

        const item = {
          parameter,
          raw: chatResp.data.text.message,
        };
        results.push(item);
        stepStatus.chat.push(item);
      } catch (err) {
        console.error(`[ERROR] Chat failed for ${parameter}`, err.message);
        const fail = {
          parameter,
          query,
          status: err.response?.status ?? 500,
          error: err.response?.data ?? err.message,
        };
        results.push(fail);
        stepStatus.chat.push(fail);
      }
    }

    console.log("[DONE] All steps complete.");
    return res.json({
      success: true,
      knowledge_base_name: kbName,
      chatbot_name: kbName,
      steps: {
        create_knowledge_base: stepStatus.create_knowledge_base.status,
        create_workflow_app: stepStatus.create_workflow_app.status,
        get_workflow_app: stepStatus.get_workflow_app.status,
      },
      results,
    });
  } catch (err) {
    console.error("[FATAL] Pipeline failed:", err.message);
    const status = err.response?.status ?? 500;
    const data = err.response?.data ?? { message: err.message };
    return res.status(status).json({ success: false, error: data, stepStatus });
  } finally {
    fs.unlink(file.path, () => {});
  }
}
