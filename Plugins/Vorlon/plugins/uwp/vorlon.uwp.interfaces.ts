module VORLON {
    export interface IUWPMonitorOptions {
        interval: number
    }

    export interface IUWPMetadata {
        isRunning : boolean,
        metadataDate: Date,
        winRTAvailable: boolean,
        name: string;
        language: string;
        region: string;
        deviceType: string;
        appversion: {
            major: number,
            minor: number,
            build: number,
            revision: number,
        };
        systemManufacturer: string;
        systemProductName: string;
    }

    export interface IUWPMemoryStatus {
        nonPagedPool: number,
        pagedPool: number,
        pageFaultCount: number,
        pageFile: number,
        peakNonPagedPool: number
        peakPagedPool: number,
        peakPageFile: number
        peakVirtualMemory: number,
        peakWorkingSet: number,
        privatePageCount: number,
        virtualMemory: number,
        workingSet: number,
    }

    export interface IUWPPhoneMemoryStatus {
        commitedBytes: number,
        commitedLimit: number,
    }

    export interface IUWPCpuStatus {
        user: number,
        kernel: number
    }

    export interface IUWPDiskStatus {
        bytesRead: number,
        bytesWritten: number,
        otherBytes: number,
        otherCount: number,
        readCount: number,
        writeCount: number,
    }

    export interface IUWPPowerStatus {
        batteryStatus: number,
        energySaverStatus: number,
        powerSupplyStatus: number,
        remainingChargePercent: number,
        remainingDischargeTime: number
    }

    export interface IUWPNetworkStatus {
        ianaInterfaceType: number,
        signal: number,
    }

    export interface IUWPEnergyStatus {
        foregroundEnergy?: {
            excessiveUsageLevel: number,
            lowUsageLevel: number,
            maxAcceptableUsageLevel: number,
            nearMaxAcceptableUsageLevel: number,
            recentEnergyUsage: number,
            recentEnergyUsageLevel: number
        },
        backgroundEnergy?: {
            excessiveUsageLevel: number,
            lowUsageLevel: number,
            maxAcceptableUsageLevel: number,
            nearMaxAcceptableUsageLevel: number,
            nearTerminationUsageLevel: number,
            recentEnergyUsage: number,
            recentEnergyUsageLevel: number,
            terminationUsageLevel: number
        }
    }

    export interface IUWPStatus {
        isRunning : boolean,
        winRTAvailable: boolean;
        statusDate: Date,
        memory?: IUWPMemoryStatus,
        cpu?: IUWPCpuStatus,
        disk?: IUWPDiskStatus,
        power?: IUWPPowerStatus,
        energy?: IUWPEnergyStatus,
        phone?: {
            memory?: IUWPPhoneMemoryStatus
        },
        network?: IUWPNetworkStatus
    }
}
