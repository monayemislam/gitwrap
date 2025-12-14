<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GitHubController extends Controller
{
    private const GITHUB_API_BASE = 'https://api.github.com';

    public function fetchData(Request $request): JsonResponse
    {
        $username = $request->query('username');

        if (!$username) {
            return response()->json(
                ['error' => 'Username is required'],
                400
            );
        }

        $token = config('services.github.token') ?? env('GITHUB_PERSONAL_ACCESS_TOKEN');
        
        if (!$token) {
            return response()->json(
                ['error' => 'GitHub token not configured'],
                500
            );
        }

        $headers = [
            'Authorization' => "token {$token}",
            'Accept' => 'application/vnd.github.v3+json',
            'User-Agent' => 'GitWrap',
        ];

        try {
            // Fetch user profile
            $userResponse = Http::withHeaders($headers)
                ->get(self::GITHUB_API_BASE . "/users/{$username}");

            if (!$userResponse->successful()) {
                if ($userResponse->status() === 404) {
                    return response()->json(
                        ['error' => 'User not found'],
                        404
                    );
                }
                throw new \Exception("GitHub API error: {$userResponse->status()}");
            }

            $user = $userResponse->json();

            // Fetch user repositories
            $reposResponse = Http::withHeaders($headers)
                ->get(self::GITHUB_API_BASE . "/users/{$username}/repos", [
                    'sort' => 'updated',
                    'per_page' => 100,
                ]);

            $repos = $reposResponse->json();

            // Filter repositories for 2025 activity
            $startOf2025 = new \DateTime('2025-01-01T00:00:00Z');
            $endOf2025 = new \DateTime('2025-12-31T23:59:59Z');

            $repos2025 = collect($repos)->filter(function ($repo) use ($startOf2025, $endOf2025) {
                $pushedAt = new \DateTime($repo['pushed_at']);
                return $pushedAt >= $startOf2025 && $pushedAt <= $endOf2025;
            })->values()->all();

            // Fetch commits for 2025
            $commits2025 = [];
            $reposToCheck = array_slice($repos2025, 0, 10); // Limit to top 10 repos to avoid rate limits

            foreach ($reposToCheck as $repo) {
                try {
                    $commitsResponse = Http::withHeaders($headers)
                        ->get(self::GITHUB_API_BASE . "/repos/{$repo['full_name']}/commits", [
                            'since' => '2025-01-01T00:00:00Z',
                            'until' => '2025-12-31T23:59:59Z',
                            'author' => $username,
                            'per_page' => 100,
                        ]);

                    if ($commitsResponse->successful()) {
                        $commits2025 = array_merge($commits2025, $commitsResponse->json());
                    }
                } catch (\Exception $e) {
                    Log::error("Error fetching commits for {$repo['full_name']}: " . $e->getMessage());
                }
            }

            // Fetch pull requests for 2025
            $prsResponse = Http::withHeaders($headers)
                ->get(self::GITHUB_API_BASE . "/search/issues", [
                    'q' => "author:{$username}+type:pr+created:2025-01-01..2025-12-31",
                    'per_page' => 100,
                ]);

            $prsData = $prsResponse->json();
            $prs2025 = $prsData['items'] ?? [];

            // Fetch issues for 2025
            $issuesResponse = Http::withHeaders($headers)
                ->get(self::GITHUB_API_BASE . "/search/issues", [
                    'q' => "author:{$username}+type:issue+created:2025-01-01..2025-12-31",
                    'per_page' => 100,
                ]);

            $issuesData = $issuesResponse->json();
            $issues2025 = $issuesData['items'] ?? [];

            // Calculate statistics
            $totalCommits = count($commits2025);
            $totalPRs = count($prs2025);
            $mergedPRs = collect($prs2025)->filter(function ($pr) {
                return $pr['state'] === 'closed' && isset($pr['merged_at']);
            })->count();
            $totalIssues = count($issues2025);
            $closedIssues = collect($issues2025)->filter(function ($issue) {
                return $issue['state'] === 'closed';
            })->count();

            // Get top languages
            $languageStats = [];
            foreach ($repos2025 as $repo) {
                if (isset($repo['language']) && $repo['language']) {
                    $language = $repo['language'];
                    $languageStats[$language] = ($languageStats[$language] ?? 0) + 1;
                }
            }

            arsort($languageStats);
            $topLanguages = array_slice(array_keys($languageStats), 0, 5);

            // Get most starred repos
            $topRepos = collect($repos2025)
                ->sortByDesc('stargazers_count')
                ->take(5)
                ->map(function ($repo) {
                    return [
                        'name' => $repo['name'],
                        'stars' => $repo['stargazers_count'],
                        'language' => $repo['language'] ?? null,
                    ];
                })
                ->values()
                ->all();

            return response()->json([
                'user' => [
                    'login' => $user['login'],
                    'name' => $user['name'] ?? $user['login'],
                    'avatar_url' => $user['avatar_url'],
                    'bio' => $user['bio'],
                    'followers' => $user['followers'],
                    'following' => $user['following'],
                    'public_repos' => $user['public_repos'],
                ],
                'stats' => [
                    'totalCommits' => $totalCommits,
                    'totalPRs' => $totalPRs,
                    'mergedPRs' => $mergedPRs,
                    'totalIssues' => $totalIssues,
                    'closedIssues' => $closedIssues,
                    'reposActive' => count($repos2025),
                    'topLanguages' => $topLanguages,
                    'topRepos' => $topRepos,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching GitHub data: ' . $e->getMessage());
            return response()->json(
                ['error' => 'Failed to fetch GitHub data'],
                500
            );
        }
    }
}

