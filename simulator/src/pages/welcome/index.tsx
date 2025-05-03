import { useMemo, useState } from "react";
import Welcome from "./components/welcome";
import { DialogContext, type DialogEnum } from "./context";
import ProjectName from "./components/project-name";
import Loading from "./components/loading";
import ProjectConfig from "./components/project-config";
import Notification from "./components/notification";

const WelcomePage = () => {
	const [dialogEnum, setDialogEnum] = useState<DialogEnum>("welcome");

	const DialogComponent = useMemo(() => {
		switch (dialogEnum) {
			case "welcome": {
				return Welcome;
			}
			case "project-name": {
				return ProjectName;
			}
			case "loading": {
				return Loading;
			}
			case "project-config": {
				return ProjectConfig;
			}
			case "notification": {
				return Notification;
			}
		}
	}, [dialogEnum]);

	return (
		<div className="h-100vh flex justify-center items-center bg-[url(/background.jpg)] bg-cover bg-no-repeat bg-center">
			<DialogContext.Provider
				value={{
					dialog: dialogEnum,
					setDialog: (dialog) => {
						setDialogEnum(dialog);
					},
				}}
			>
				<div className="bg-[#3d3d3d] shadow-md shadow-black w-[40vw] min-w-[32rem] min-h-[30vw] rounded-md p-4 flex flex-row">
					<DialogComponent />
				</div>
			</DialogContext.Provider>
		</div>
	);
};

export default WelcomePage;
