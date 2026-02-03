import React from "react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { AllEnterpriseModule, LicenseManager } from "ag-grid-enterprise";
import AppRouter from "@/routes";

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

// Set Enterprise License Key
LicenseManager.setLicenseKey("Using_this_{AG_Grid}_Enterprise_key_{AG-092348}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Visitly_LLC}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{Visitly_Portal}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{Visitly_Portal}_need_to_be_licensed___{Visitly_Portal}_has_been_granted_a_Deployment_License_Add-on_for_{1}_Production_Environment___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{30_July_2026}____[v3]_[01]_MTc4NTM2NjAwMDAwMA==62278b4b49ba4bcea428f52ea69edbb3");

const App = () => {
  return <div data-test-id="host-mfe-app-root">
    <AppRouter />
  </div>;
};

export default App;
