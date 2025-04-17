import { useMemo, useState } from "react";
import Welcome from "./components/welcome";
import { DialogContext } from "./context";

const WelcomePage = () => {
	const [dialogEnum, setDialogEnum] = useState<"welcome">("welcome");

	const DialogComponent = useMemo(() => {
		switch (dialogEnum) {
			case "welcome": {
				return Welcome;
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
