import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useProjectStats(projectId: string) {
    const { data, isLoading, error } = useSWR(
        `/api/projects/${projectId}/stats`,
        fetcher,
        {
            refreshInterval: 10000 // auto refresh 10s
        }
    )

    return {
        stats: data,
        isLoading,
        error
    }
}