import {
	Button,
	Menu,
	MenuItem,
	MenuList,
	MenuPopover,
	MenuTrigger,
} from "@fluentui/react-components";
import { Map24Regular } from "@fluentui/react-icons";
import DataInput, { type DataInputHandle } from "./data_input";
import { useCallback, useRef } from "react";

const TopBar = () => {
	const dataInputRef = useRef<DataInputHandle>(null);

	const onFileButtonClicked = useCallback(() => {
		dataInputRef.current?.triggerUploadDialog();
	}, []);
	return (
		<>
			<DataInput ref={dataInputRef} />
			<Map24Regular className="mx-[1rem] my-0" />
			<Menu positioning={{ autoSize: true }}>
				<MenuTrigger disableButtonEnhancement>
					<Button appearance="outline">File</Button>
				</MenuTrigger>

				<MenuPopover>
					<MenuList>
						<MenuItem onClick={onFileButtonClicked}>Open File...</MenuItem>
					</MenuList>
				</MenuPopover>
			</Menu>
		</>
	);
};

export default TopBar;
