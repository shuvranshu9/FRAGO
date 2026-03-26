
import Pagination from "@mui/material/Pagination";
import { theme } from "../../styles/theme";

const CustomPagination = ({ page, totalPages, onChange }) => {
	if (!totalPages || totalPages <= 1) return null;

	return (
		<div className="flex justify-center mt-8">
			<Pagination
				count={totalPages}
				page={page}
				onChange={(_, value) => onChange(value)}
				shape="circular"
				sx={{
					"& .MuiPaginationItem-root": {
						color: theme.colors.secondary,
						borderColor: "transparent",
						borderRadius: 9999,
						fontWeight: 700,
						"&:hover": {
							backgroundColor: theme.colors.surface,
						},
					},
					"& .MuiPaginationItem-root.Mui-selected": {
						backgroundColor: theme.colors.primary,
						color: theme.colors.text.inverse,
						"&:hover": {
							backgroundColor: theme.colors.secondary,
						},
					},
				}}
			/>
		</div>
	);
};

export default CustomPagination;
