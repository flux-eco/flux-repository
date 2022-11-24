import FluxRepositoryApi from "../../src/Adapters/Api/FluxRepositoryApi.mjs";
const applicationName = "example-app"
const backendBaseUrl = window.location + "./any-backend";
const definitionsBaseUrl = window.location + "../../definitions";

await FluxRepositoryApi.initializeOfflineFirstRepository(
    {
        applicationName: applicationName,
        logEnabled: true,
        definitionsBaseUrl: definitionsBaseUrl,
        projectionApiBaseUrl: backendBaseUrl
    },
);