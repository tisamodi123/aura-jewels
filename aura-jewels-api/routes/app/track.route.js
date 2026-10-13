import express from "express";
import {
    trackEvent,
    trackViewContent,
    trackContact,
    trackLeadSubmitted
} from "../../controllers/app/track.controller.js";

const route = express.Router();

// Tracking routes called from client-side (frontend)
route.post("/", trackEvent);
route.post("/view-content", trackViewContent);
route.post("/contact", trackContact);
route.post("/lead-submitted", trackLeadSubmitted);

export default route;
