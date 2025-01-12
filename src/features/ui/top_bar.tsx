import {
	Button,
	Menu,
	MenuItem,
	MenuList,
	MenuPopover,
	MenuTrigger,
} from "@fluentui/react-components";
import { Map24Regular } from "@fluentui/react-icons";
import { useCallback, useEffect, useRef } from "react";

const TopBar = () => {
	//TODO: Move fileInput to a seperated file.
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const fileElement = fileInputRef.current;

		fileElement?.addEventListener("change", () => {
			const file = fileElement.files?.[0];

			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const contents = e.target?.result;
					console.log(contents);
				};

				reader.onerror = (e) => {
					console.error("Error reading file", e);
				};

				reader.readAsText(file);
			}
		});
	}, []);

	const onOpenFileItemClicked = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	return (
		<div
			style={{
				flexBasis: "3rem",
				flexGrow: 0,
				display: "flex",
				alignItems: "center",
				zIndex: 2,
			}}
		>
			{/* Place input element here to trigger file reader and corresponding functions */}
			<input type="file" style={{ display: "none" }} ref={fileInputRef} />

			<Map24Regular style={{ margin: "0rem 1rem" }} />
			<Menu positioning={{ autoSize: true }}>
				<MenuTrigger disableButtonEnhancement>
					<Button appearance="outline">File</Button>
				</MenuTrigger>

				<MenuPopover>
					<MenuList>
						<MenuItem onClick={onOpenFileItemClicked}>Open File...</MenuItem>
					</MenuList>
				</MenuPopover>
			</Menu>
		</div>
	);
};

export default TopBar;
