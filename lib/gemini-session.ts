import { ChatSession } from "@google/generative-ai";

let activeChatSession: ChatSession | null = null;

export function setActiveSession(session: ChatSession) {
    activeChatSession = session;
}

export function getActiveSession() {
    return activeChatSession;
}
