import { useAppstore } from "@/store";
import {
	Button,
	Card,
	CardHeader,
	Subtitle1,
	Text,
	Caption1,
} from "@fluentui/react-components";

const WelcomePage = () => {
	const setPage = useAppstore((state) => state.setPage);
	return (
		<div className="h-100vh flex justify-center items-center bg-[url(/background.jpg)] bg-cover bg-no-repeat bg-center">
			<div className="bg-[#3d3d3d] shadow-md shadow-black w-[30vw] h-[20vw] rounded-md flex flex-row p-4">
				<div className="flex-grow-1.2 flex items-center justify-center p-5">
					<Button
						size="large"
						onClick={() => {
							setPage("traffic");
						}}
					>
						Create New
					</Button>
				</div>
				<div className="w-[1px] bg-gray" />
				<div className="flex-grow-2 flex flex-col p-5">
					<Subtitle1 className="mb-6">History</Subtitle1>
					{[0, 1, 2, 3, 4, 5].map((index) => (
						<Card size="small" key={index} className="mb-3">
							<CardHeader
								header={
									<Text weight="semibold">{`Template Project ${index}`}</Text>
								}
								description={<Caption1>Local Drive &gt; Documents</Caption1>}
							/>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
};

export default WelcomePage;
