import { useAppstore } from "@/store";
import { Map24Regular } from "@fluentui/react-icons";
// import type { DataInputHandle } from "./data_input";
// import { useCallback, useRef } from "react";

const TopBar = () => {
	//const dataInputRef = useRef<DataInputHandle>(null);

	// const onFileButtonClicked = useCallback(() => {
	// 	dataInputRef.current?.triggerUploadDialog();
	// }, []);

	const setPage = useAppstore((store) => store.setPage);
	return (
		<>
			{/* <DataInput ref={dataInputRef} /> */}
			<Map24Regular
				className="mx-[1rem] my-0"
				onClick={() => {
					setPage("welcome");
				}}
			/>
			{/* <Menu positioning={{ autoSize: true }}>
				<MenuTrigger disableButtonEnhancement>
					<Button appearance="outline">File</Button>
				</MenuTrigger>

				<MenuPopover>
					<MenuList>
						<MenuItem onClick={onFileButtonClicked}>Open File...</MenuItem>
					</MenuList>
				</MenuPopover>
			</Menu> */}
		</>
	);
};

export default TopBar;
