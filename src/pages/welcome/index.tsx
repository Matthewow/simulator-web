import { useMemo, useState } from "react";
import Welcome from "./components/welcome";
import { DialogContext, type DialogEnum } from "./context";
import ProjectName from "./components/project-name";

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
				<DialogComponent />
			</DialogContext.Provider>
		</div>
	);
};

export default WelcomePage;
