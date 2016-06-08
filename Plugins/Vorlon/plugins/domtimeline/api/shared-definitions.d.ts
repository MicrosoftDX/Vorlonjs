interface DataForEntry {
    type:string,
    description: string,
    timestamp: number,
	rawData: any,
    details: any,
}

interface ClientDataForEntry extends DataForEntry {
	// data only available on the client side of things
	__dashboardData?: any,
}

interface DashboardDataForEntry extends DataForEntry {
	// data only available on the dashboard side of things
    isCancelled?: boolean
}