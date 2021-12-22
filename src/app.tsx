import React from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";

import { Dashboard } from "./dashboard/dashboard";
import "./styles.scss";

render(
	(
		<RecoilRoot>
			<Dashboard />
		</RecoilRoot>
	), 
	document.getElementById("app")
);
