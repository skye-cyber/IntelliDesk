
const Custommessage = `
<think>
Key Optimizations:
Early Return for Authentication Check: We immediately return None if the user is not authenticated.
Simplified Farm Check: We return None if no farms are found for the user.
Consistent Handling of farms: We handle both QuerySet and list cases in a more readable manner.
Reduced Redundancy: We avoid repeating the isinstance check by handling both locations and names in a single block.
</think>
Explanation:
Authentication Check: The function first checks if the user is authenticated. If not, it returns None.
Farms Filtering: It filters the FarmInformation objects for the current user.
No Farms Found: If no farms are found, it returns None.
Location or Name Selection: Depending on the locations and names parameters, it extracts either farm_location or farm_name from the farms queryset or list.
\`\`\`html

<div aria-label="AI code canvas container" class="ai-canvas-container w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col h-[93vh] overflow-hidden ring-1 ring-purple-200 dark:ring-purple-700">
<!-- Header with title and theme toggle -->
<header class="flex items-center justify-between px-3 py-1 border-b border-purple-200 dark:border-purple-700 select-none">
<h2 class="text-xl font-semibold text-purple-900 dark:text-purple-200">Canvas</h2>
<button id="canvas-theme-toggle" aria-label="Toggle dark mode" class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400" title="Toggle theme">
<svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-purple-700 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
<svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-purple-600 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
</button>
</header>

<!-- Main AI canvas content -->
<container class="flex-1 overflow-y-auto w-full p-2 space-y-8 scroll-smooth ai-canvas-scrollbar">
<!-- Code & Preview block -->
<article class="bg-purple-50 dark:bg-purple-900 rounded-2xl shadow-inner ring-1 ring-purple-300 dark:ring-purple-600 p-6 flex flex-col max-h-full">

<!-- Buttons row -->
<div class="flex justify-end gap-4 mb-4 select-none">
<button id="btn-code" class="flex items-center gap-1 px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400 font-normal text-md" title="Show Code">
&lt;/&gt; Code
</button>

<button id="btn-preview" class="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-700 shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-purple-400" title="Show Preview">
<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12v12H4z"/></svg>
Preview
</button>
<button id="btn-copy" class="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-400" title="Copy Code">
<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v2"/><rect x="8" y="8" width="8" height="8" rx="2"/></svg>
Copy
</button>
</div>

<!-- Code block with line numbers and code content side by side -->
<div id="code-block-container" class="flex flex-row max-h-full overflow-hidden rounded-lg ring-2 ring-purple-300 dark:ring-purple-700 shadow-inner bg-white dark:bg-purple-700 select-text font-mono text-sm text-purple-900 dark:text-purple-200">
<!-- Line numbers gutter -->
<pre id="line-numbers" class="line-numbers bg-purple-100 dark:bg-purple-900 p-4 border-r border-purple-200 dark:border-purple-700 overflow-hidden"></pre>

<!-- Code content area -->
<pre id="code-view" tabindex="0" aria-label="Code editor view" class="flex-1 p-4 overflow-y-auto h-full whitespace-pre-wrap scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100 dark:scrollbar-track-purple-900" contenteditable="true" spellcheck="false"></pre>
</div>

<!-- Preview block -->
<div id="preview-view" tabindex="0" aria-label="Preview output" class="hidden bg-white dark:bg-purple-800 rounded-lg p-6 ring-2 ring-purple-300 dark:ring-purple-700 shadow-inner max-h-full overflow-auto text-purple-900 dark:text-purple-200 font-sans text-base whitespace-pre-wrap">
Hello, QuickAI Canvas!
</div>
</article>
</container>
\`\`\``

const custom2 = `\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<!--<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">-->
<title>QuickAi - Chat</title>
<link rel="stylesheet" href="css/styles.css">
<!--<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.4.0/styles/default.min.css" />-->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" crossorigin="anonymous"/>
<link rel="stylesheet" href="js/katex/katex.min.css">
<script defer src="js/katex/katex.min.js"></script>
<script defer src="js/katex/contrib/auto-render.min.js"></script>
</head>
<!-- Main Container -->
<body id="main" class="h-[100vh] w-[100vw] max-h-[100vh] max-w-[100vw] px-3 py-4 mt-0 bg-white bg-opacity-90 rounded-b-none shadow-lg shadow-inner shadow-gray-800 dark:bg-neutral-900 rounded-t-none overflow-hidden transition-all duration-500">

<!-- Header -->
<header class="space-b-2 mb-2 z-15 transition-all duration-500">
<div class="flex justify-between">
<section class="flex justify-start">
<!-- Toggle Button -->
<section class="relative mr-14">
<button id="togglePane" title="View Chats" class="absolute z-5 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-700" onclick="document.getElementById('conversationPane').classList.toggle('-translate-x-full')">
<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
</svg>
</button>
</section>
<select id="model" class="hidden transition-all duration-700">
<!--Chat & coding models-->
<option data-class="hf" value="Qwen/Qwen2.5-72B-Instruct">Basic mode</option>
<option data-class="hf" value="Qwen/Qwen2.5-Coder-32B-Instruct">Coding mode</option>
<option data-class="hf" value="deepseek-ai/DeepSeek-R1">DeepSeek-R1</option>
<option data-class="hf" value="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B">DeepSeek-R1-Distill-Qwen-32B</option>
<option data-class="hf" value="meta-llama/Llama-3.3-70B-Instruct">Llama-3.3-70B-Instruct</option>
<option data-class="hf" value="nvidia/Llama-3.1-Nemotron-70B-Instruct-HF">Llama-3.1-Nemotron-70B-Instruct-HF</option>
<option data-class="hf" value="Qwen/QwQ-32B-Preview">Qwen/QwQ-32B-Preview</option>
<option data-class="hf" value="mistralai/Mistral-Nemo-Instruct-2407">Mistral-Nemo-Instruct-2407</option>
<option data-class="hf" value="microsoft/Phi-3.5-mini-instruct">Phi-3.5-mini-instruct</option>
<option data-class="hf" value="CohereForAI/c4ai-command-r-plus-08-2024">c4ai-command-r-plus-08-2024</option>
<option data-class="hf" value="NousResearch/Hermes-3-Llama-3.1-8B">Hermes-3-Llama-3.1-8B</option>
<option data-class="hf" value="Qwen/Qwen2.5-Coder-7B-Instruct">Qwen/Qwen2.5-Coder-7B-Instruct</option>
<!--Vision/multimodal models-->
<option data-class="hf" value="meta-llama/Llama-3.2-11B-Vision-Instruct">Vision</option>
<option data-class="hf" value="Qwen/Qwen2-VL-7B-Instruct">Qwen2-VL-7B-Instruct</option>
<!--Math models-->
<option data-class="hf" value="Qwen/Qwen2.5-Math-1.5B">Qwen2.5-Math-1.5B</option>

<!--Mistra model-->
<option data-class="mistral" value="open-mistral-7b">open-mistral-7b</option>
<option data-class="mistral" value="open-mixtral-8x7b">open-mixtral-8x7b</option>
<option data-class="mistral" value="open-mixtral-8x22b">open-mixtral-8x22b</option>
<option data-class="mistral" value="mistral-small-2402">mistral-small-2402</option>
<option data-class="mistral" value="mistral-small-2409">mistral-small-2409</option>
<option data-class="mistral" value="mistral-small-2501">mistral-small-2501</option>
<option data-class="mistral" value="mistral-medium">mistral-medium</option>
<option data-class="mistral" value="mistral-large-latest">mistral-large-latest</option>
<option data-class="mistral" value="mistral-large-2402">mistral-large-2402</option>
<option data-class="mistral" value="mistral-large-2407">mistral-large-2407</option>
<option data-class="mistral" value="mistral-large-2411">mistral-large-2411</option>
<option data-class="mistral" value="mistral-saba-2502">mistral-saba-2502</option>
<option data-class="mistral" value="mistral-embed">mistral-embed</option>
<option data-class="mistral" value="codestral-latest">codestral-latest</option>
<option data-class="mistral" value="codestral-2405">codestral-2405</option>
<option data-class="mistral" value="codestral-2501">codestral-2501</option>
<option data-class="mistral" value="codestral-mamba-2407">codestral-mamba-2407</option>
<option data-class="mistral" value="open-mistral-nemo">open-mistral-nemo</option>
<option data-class="mistral" value="pixtral-12b-2409">pixtral-12b-2409</option>
<option data-class="mistral" value="pixtral-large-2411">pixtral-large-2411</option>
<option data-class="mistral" value="ministral-3b-2410">ministral-3b-2410</option>
<option data-class="mistral" value="ministral-8b-2410">ministral-8b-2410</option>
<option data-class="mistral" value="mistral-small-latest">mistral-small-latest</option>
<option data-class="mistral" value="mistral-moderation-2411">mistral-moderation-2411</option>
</select>

<div class="relative">
<button id="modelButton" class="rounded-lg ml-1 p-2 font-semibold bg-gray-200 hover:bg-blue-200 text-sky-900 dark:text-gray-100 rounded-md dark:bg-zinc-950 dark:hover:bg-stone-600 outline-none cursor-pointer transition-colors duration-1000">
<div class="flex">
<span id="selectedModelText" data-class="hf" class="text-lg">Basic mode</span>
<svg class="mt-1" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
</div>
</button>
<div id="modelDropdown" class="fixed z-50 mt-1 hidden w-fit max-h-[88vh] overflow-y-auto py-1 max-w-md bg-white border-2 border-gray-300 dark:border-none dark:bg-neutral-700 text-gray-800 dark:text-gray-300 rounded-lg shadow-lg overflow-x-hidden whitespace-wrap text-ellipsis ::-webkit-scrollbar-track:rounded-lg ::-webkit-scrollbar-color-[#0055ff] animation transition-colors duration-1000">
<div role="menu" aria-orientation="vertical">
<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff] transition-colors duration-1000" tabindex="-1" data-value="Qwen/Qwen2.5-72B-Instruct">
<div class="flex grow items-center justify-between gap-2">
<div class="flex items-center gap-3">
<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-black dark:text-gray-200">
<path d="M15.11 14.285a.41.41 0 0 1 .78 0c.51 2.865.96 3.315 3.825 3.826.38.12.38.658 0 .778-2.865.511-3.315.961-3.826 3.826a.408.408 0 0 1-.778 0c-.511-2.865-.961-3.315-3.826-3.826a.408.408 0 0 1 0-.778c2.865-.511 3.315-.961 3.826-3.826Zm2.457-12.968a.454.454 0 0 1 .866 0C19 4.5 19.5 5 22.683 5.567a.454.454 0 0 1 0 .866C19.5 7 19 7.5 18.433 10.683a.454.454 0 0 1-.866 0C17 7.5 16.5 7 13.317 6.433a.454.454 0 0 1 0-.866C16.5 5 17 4.5 17.567 1.317Z" fill="currentColor"></path>
<path fill-rule="evenodd" clip-rule="evenodd" d="M7.001 4a1 1 0 0 1 .993.887c.192 1.7.701 2.877 1.476 3.665.768.783 1.913 1.3 3.618 1.452a1 1 0 0 1-.002 1.992c-1.675.145-2.849.662-3.638 1.452-.79.79-1.307 1.963-1.452 3.638a1 1 0 0 1-1.992.003c-.152-1.706-.67-2.851-1.452-3.62-.788-.774-1.965-1.283-3.665-1.475a1 1 0 0 1-.002-1.987c1.73-.2 2.878-.709 3.646-1.476.767-.768 1.276-1.916 1.476-3.646A1 1 0 0 1 7 4Zm-2.472 6.998a6.11 6.11 0 0 1 2.468 2.412 6.232 6.232 0 0 1 1.037-1.376 6.232 6.232 0 0 1 1.376-1.036 6.114 6.114 0 0 1-2.412-2.469 6.163 6.163 0 0 1-1.053 1.416 6.163 6.163 0 0 1-1.416 1.053Z" fill="currentColor"></path>
</svg>
</div>
<div>
Basic mode <sub><span class="text-yellow-500 text-xl">{</span>
	<span class="text-transparent bg-clip-text bg-gradient-to-tr from-blue-700 to-orange-400 text-sm"> <span class="font-mono">Qwen2.5-72B-Instruct<span class="text-orange-500 text-xl">}</span></sub>
	<div class="text-gray-500 dark:text-gray-400 text-xs">Default conversation model</div>
	</div>
	</div>
	</div>
	</div>
	<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="Qwen/Qwen2.5-Coder-32B-Instruct">
	<div class="flex grow items-center justify-between gap-2">
	<div class="flex items-center gap-3">
	<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-black dark:text-gray-200">
	<path fill-rule="evenodd" clip-rule="evenodd" d="M12 7.42a22.323 22.323 0 0 0-2.453 2.127A22.323 22.323 0 0 0 7.42 12a22.32 22.32 0 0 0 2.127 2.453c.807.808 1.636 1.52 2.453 2.128a22.335 22.335 0 0 0 2.453-2.128A22.322 22.322 0 0 0 16.58 12a22.326 22.326 0 0 0-2.127-2.453A22.32 22.32 0 0 0 12 7.42Zm1.751-1.154a24.715 24.715 0 0 1 2.104 1.88 24.722 24.722 0 0 1 1.88 2.103c.316-.55.576-1.085.779-1.59.35-.878.507-1.625.503-2.206-.003-.574-.16-.913-.358-1.111-.199-.199-.537-.356-1.112-.36-.58-.003-1.328.153-2.205.504-.506.203-1.04.464-1.59.78Zm3.983 7.485a24.706 24.706 0 0 1-1.88 2.104 24.727 24.727 0 0 1-2.103 1.88 12.7 12.7 0 0 0 1.59.779c.878.35 1.625.507 2.206.503.574-.003.913-.16 1.111-.358.199-.199.356-.538.36-1.112.003-.58-.154-1.328-.504-2.205a12.688 12.688 0 0 0-.78-1.59ZM12 18.99c.89.57 1.768 1.03 2.605 1.364 1.026.41 2.036.652 2.955.646.925-.006 1.828-.267 2.5-.94.673-.672.934-1.575.94-2.5.006-.919-.236-1.929-.646-2.954A15.688 15.688 0 0 0 18.99 12a15.6 15.6 0 0 0 1.364-2.606c.41-1.025.652-2.035.646-2.954-.006-.925-.267-1.828-.94-2.5-.672-.673-1.575-.934-2.5-.94-.919-.006-1.929.235-2.954.646-.838.335-1.716.795-2.606 1.364a15.69 15.69 0 0 0-2.606-1.364C8.37 3.236 7.36 2.994 6.44 3c-.925.006-1.828.267-2.5.94-.673.672-.934 1.575-.94 2.5-.006.919.235 1.929.646 2.955A15.69 15.69 0 0 0 5.01 12c-.57.89-1.03 1.768-1.364 2.605-.41 1.026-.652 2.036-.646 2.955.006.925.267 1.828.94 2.5.672.673 1.575.934 2.5.94.92.006 1.93-.235 2.955-.646A15.697 15.697 0 0 0 12 18.99Zm-1.751-1.255a24.714 24.714 0 0 1-2.104-1.88 24.713 24.713 0 0 1-1.88-2.104c-.315.55-.576 1.085-.779 1.59-.35.878-.507 1.625-.503 2.206.003.574.16.913.359 1.111.198.199.537.356 1.111.36.58.003 1.328-.153 2.205-.504.506-.203 1.04-.463 1.59-.78Zm-3.983-7.486a24.727 24.727 0 0 1 1.88-2.104 24.724 24.724 0 0 1 2.103-1.88 12.696 12.696 0 0 0-1.59-.779c-.878-.35-1.625-.507-2.206-.503-.574.003-.913.16-1.111.359-.199.198-.356.537-.36 1.111-.003.58.153 1.328.504 2.205.203.506.464 1.04.78 1.59Z" fill="currentColor"></path>
	</svg>
	</div>
	<div>
	Coding mode <sub><span class="text-yellow-500 text-xl">{</span>
		<span class="text-transparent bg-clip-text bg-gradient-to-tr from-blue-700 to-orange-400 text-sm"> <span class="font-mono">Qwen2.5-Coder-32B-Instruct<span class="text-orange-500 text-xl">}</span></sub>
		<div class="text-gray-500 dark:text-gray-400 text-xs">Supports advanced coding tasks</div>
		</div>
		</div>
		</div>
		</div>
		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="deepseek-ai/DeepSeek-R1">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-300 dark:bg-zinc-700">
		<img class="rounded-full overflown aspect-square size-6 rounded border dark:border-gray-700" src="../assets/deepseek-logo.webp" alt="/deepseek-logo logo">
		</div>
		<div>
		DeepSeek-R1
		<div class="text-gray-500 dark:text-gray-400 text-xs">The first reasoning model from DeepSeek.</div>
		</div>
		</div>
		</div>
		</div>

		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="deepseek-ai/DeepSeek-R1-Distill-Qwen-32B">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-300 dark:bg-zinc-700">
		<img class="rounded-full overflown aspect-square size-6 rounded border dark:border-gray-700" src="../assets/deepseek-logo.webp" alt="/deepseek-logo logo">
		</div>
		<div>
		DeepSeek-R1-Distill-Qwen-32B
		<div class="text-gray-500 dark:text-gray-400 text-xs">The first reasoning model from DeepSeek, distilled into a 32B dense model. Outperforms o1-mini on multiple benchmarks.</div>
		</div>
		</div>
		</div>
		</div>
		<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 h-px bg-gray-700 dark:bg-sky-400"></div>


		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="microsoft/Phi-3.5-mini-instruct">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
		<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/microsoft-logo.png" alt="Phi-3.5-mini-instruct logo">
		</div>
		<div>
		Phi-3.5-mini-instruct
		<div class="text-gray-500 dark:text-gray-400 text-xs">One of the best small models (3.8B parameters), super fast for simple tasks.</div>
		</div>
		</div>
		</div>
		</div>

		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="Qwen/QwQ-32B-Preview">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
		<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/qwen-logo.png" alt="Qwen/QwQ-32B-Preview logo">
		</div>
		<div>
		Qwen/QwQ-32B-Preview
		<div class="text-gray-500 dark:text-gray-400 text-xs">QwQ is an experiment model from the Qwen Team with advanced reasoning capabilities.</div>
		</div>
		</div>
		</div>
		</div>

		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistralai/Mistral-Nemo-Instruct-2407">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
		<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="Mistral-Nemo-Instruct-2407 logo">
		</div>
		<div>
		Mistral-Nemo-Instruct-2407
		<div class="text-gray-500 dark:text-gray-400 text-xs">A small model with good capabilities in language understanding and commonsense reasoning.</div>
		</div>
		</div>
		</div>
		</div>

		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistralai/Mistral-7B-Instruct-v0.3">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
		<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="Mistral-7B-Instruct-v0.3 logo">
		</div>
		<div>
		Mistral-7B-Instruct-v0.3
		<div class="text-gray-500 dark:text-gray-400 text-xs">An instruct fine-tuned version of the Mistral-7B-v0.3.</div>
		</div>
		</div>
		</div>
		</div>

		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="NousResearch/Hermes-3-Llama-3.1-8B">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
		<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/nous-logo.png" alt="Hermes-3-Llama-3.1-8B logo">
		</div>
		<div>
		Hermes-3-Llama-3.1-8B
		<div class="text-gray-500 dark:text-gray-400 text-xs">Nous Research's latest Hermes 3 release in 8B size. Follows instruction closely.</div>
		</div>
		</div>
		</div>
		</div>

		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="Qwen/Qwen2.5-Coder-7B-Instruct">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
		<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/qwen-logo.png" alt="Qwen/QwQ-32B-Preview logo">
		</div>
		<div>
		Qwen2.5-Coder-7B-Instruct
		<div class="text-gray-500 dark:text-gray-400 text-xs">latest series of Code-Specific Qwen large language models (formerly known as CodeQwen).</div>
		</div>
		</div>
		</div>
		</div>

		<!--Math Seperator-->
		<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
		<div class="flex-1 h-px bg-gradient-to-r from-[#ffaa00] to-[#00ff00]"></div>
		<div class="px-8">
		<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
		</svg>
		</div>
		<div class="flex-1 h-px bg-gradient-to-r from-[#55ff7f] to-[#0055ff]"></div>
		</div>
		<div class="mx-5 my-2 text-sm text-center font-mono text-[#55aaff] font-semibold">
		<p>Math models</p>
		</div>

		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="Qwen/Qwen2.5-Math-1.5B">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
		<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/qwen-logo.png" alt="Qwen/QwQ-32B-Preview logo">
		</div>
		<div>
		Qwen2.5-Math-1.5B
		<div class="text-gray-500 dark:text-gray-400 text-xs">Mathematical Model by qwen Team.</div>
		</div>
		</div>
		</div>
		</div>

		<!--Multimodal Seperator-->
		<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
		<div class="flex-1 h-px bg-gradient-to-r from-purple-500 to-[#ffaa00]"></div>
		<div class="px-8">
		<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
		</svg>
		</div>
		<div class="flex-1 h-px bg-gradient-to-r from-[#55ff7f] to-pink-500"></div>
		</div>
		<div class="mx-5 my-2 text-sm text-center font-mono text-[#55aaff] font-semibold">
		<p>Multi-modal models</p>
		</div>

		<!--Multimodal models -->
		<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="meta-llama/Llama-3.2-11B-Vision-Instruct">
		<div class="flex grow items-center justify-between gap-2">
		<div class="flex items-center gap-3">
		<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-[#00aaff]">
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-black dark:text-gray-200">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.0755 7.93219C16.5272 8.25003 16.6356 8.87383 16.3178 9.32549L11.5678 16.0755C11.3931 16.3237 11.1152 16.4792 10.8123 16.4981C10.5093 16.517 10.2142 16.3973 10.0101 16.1727L7.51006 13.4227C7.13855 13.014 7.16867 12.3816 7.57733 12.0101C7.98598 11.6386 8.61843 11.6687 8.98994 12.0773L10.6504 13.9039L14.6822 8.17451C15 7.72284 15.6238 7.61436 16.0755 7.93219Z" fill="currentColor"></path>
		</svg>
		</div>
		<div>
		Vision <sub><span class="text-yellow-500 text-xl">{</span>
			<span class="text-transparent bg-clip-text bg-gradient-to-tr from-blue-700 to-orange-400 text-sm"> <span class="font-mono">Llama-3.2-11B-Vision-Instruct<span class="text-orange-500 text-xl">}</span></sub>
			<div class="text-gray-500 dark:text-gray-400 text-xs">The latest multimodal model from Meta! Supports image inputs natively.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="Qwen/Qwen2-VL-7B-Instruct">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img width="24" height="24" class="overflown aspect-square size-6 rounded border dark:border-gray-700" src="../assets/qwen-logo.png" alt="Qwen/QwQ-32B-Preview logo">
			</div>
			<div>
			Qwen2-VL-7B-Instruct
			<div class="text-gray-500 dark:text-gray-400 text-xs">Latest iteration of Qwen-VL model.</div>
			</div>
			</div>
			</div>
			</div>

			<!--Pro Seperator-->
			<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
			<div class="flex-1 h-px bg-gradient-to-r from-purple-500 to-pink-500"></div>
			<div class="px-8">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
			</svg>
			</div>
			<div class="flex-1 h-px bg-gradient-to-r from-purple-500 to-pink-500"></div>
			</div>
			<div class="mx-5 my-2 text-center text-purple-500 font-bold">
			<p class="text-sm">Pro Models</p>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="meta-llama/Llama-3.3-70B-Instruct">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/meta-logo.png" alt="Llama-3.3-70B-Instruct logo">
			</div>
			<div>
			Llama-3.3-70B-Instruct
			<div class="text-gray-500 dark:text-gray-400 text-xs">A fast and extremely capable model matching closed sourced models' capabilities</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="nvidia/Llama-3.1-Nemotron-70B-Instruct-HF">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/nvidia-logo.png" alt="Llama-3.1-Nemotron-70B-Instruct-HF logo">
			</div>
			<div>
			Llama-3.1-Nemotron-70B-Instruct-HF
			<div class="text-gray-500 dark:text-gray-400 text-xs">Nvidia's latest Llama fine-tune, topping alignment benchmarks and optimized for instruction following.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="CohereForAI/c4ai-command-r-plus-08-2024">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/cohere-logo.png" alt="c4ai-command-r-plus-08-2024 logo">
			</div>
			<div>
			c4ai-command-r-plus-08-2024
			<div class="text-gray-500 dark:text-gray-400 text-xs">Cohere's largest language model, optimized for conversational interaction and tool use. Now with the 2024 update!</div>
			</div>
			</div>
			</div>
			</div>

			<!--Mistral Models Seperator-->
			<div role="separator" aria-orientation="horizontal" class="mx-4 p-2 my-1 flex justify-center">
			<div class="flex-1 rounded-md p-1 h-px bg-gradient-to-r from-[#00fab7] via-[#0080bc] to-[#00fe00]"></div>
			</div>
			<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
			<div class="flex-1 h-px bg-gradient-to-r from-[#ffaa00] to-[#00ff00]"></div>
			<div class="px-8">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
			</svg>
			</div>
			<div class="flex-1 h-px bg-gradient-to-r from-[#55ff7f] to-[#0055ff]"></div>
			</div>

			<div class="mx-5 my-2 text-sm text-center font-mono text-[#5e01ff] dark:text-[#aaaaff] font-semibold">
			<p>Mistral models</p>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-large-latest">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-large-latest logo">
			</div>
			<div>
			mistral-large-latest <sup class="text-green-400 font-mono">Recommended</sup>
			<div class="text-gray-500 dark:text-gray-400 text-xs">The latest iteration of the large LLM.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-small-2402">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-small-2402 logo">
			</div>
			<div>
			mistral-small-2402
			<div class="text-gray-500 dark:text-gray-400 text-xs">A compact language model tailored for efficient processing with a focus on smaller datasets and applications requiring lower resource consumption.</div>
			</div>
			</div>
			</div>
			</div>


			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="open-mixtral-8x22b">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="open-mixtral-8x22b logo">
			</div>
			<div>
			open-mixtral-8x22b
			<div class="text-gray-500 dark:text-gray-400 text-xs">A powerful ensemble model optimized for complex language tasks and high accuracy.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="open-mixtral-8x7b">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="Qopen-mixtral-8x7b logo">
			</div>
			<div>
			open-mixtral-8x7b
			<div class="text-gray-500 dark:text-gray-400 text-xs">For enhanced performance in diverse NLP applications.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="open-mistral-7b">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="open-mistral-7b logo">
			</div>
			<div>
			open-mistral-7b
			<div class="text-gray-500 dark:text-gray-400 text-xs">General-purpose natural language understanding and generation tasks</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-large-2407">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-large-2407 logo">
			</div>
			<div>
			mistral-large-2407
			<div class="text-gray-500 dark:text-gray-400 text-xs">An enhanced version of the large model, featuring improvements in training data and techniques for superior language comprehension and generation.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-large-2402">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-large-2402 logo">
			</div>
			<div>
			mistral-large-2402
			<div class="text-gray-500 dark:text-gray-400 text-xs">A large language model optimized for high-performance tasks, offering advanced capabilities in understanding and generating human-like text.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-medium">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-medium logo">
			</div>
			<div>
			mistral-medium
			<div class="text-gray-500 dark:text-gray-400 text-xs">A medium-sized model that strikes a balance between performance and resource efficiency, suitable for a wide range of NLP tasks.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-small-2501">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-small-2501 logo">
			</div>
			<div>
			mistral-small-2501
			<div class="text-gray-500 dark:text-gray-400 text-xs">A further refined small model designed for rapid inference and deployment in resource-constrained environments while maintaining robust language capabilities.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-small-2409">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-small-2409 logo">
			</div>
			<div>
			mistral-small-2409
			<div class="text-gray-500 dark:text-gray-400 text-xs">An updated small model variant that improves upon its predecessor with enhanced training techniques for better performance in lightweight applications.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="ministral-8b-2410">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="ministral-8b-2410 logo">
			</div>
			<div>
			ministral-8b-2410
			<div class="text-gray-500 dark:text-gray-400 text-xs">provides enhanced capabilities for various NLP tasks while maintaining efficiency in resource usage.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="ministral-3b-2410">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="ministral-3b-2410 logo">
			</div>
			<div>
			ministral-3b-2410
			<div class="text-gray-500 dark:text-gray-400 text-xs">Variant designed for efficient processing in specific applications, offering a balance between performance and resource usage.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="open-mistral-nemo">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="open-mistral-nemo logo">
			</div>
			<div>
			open-mistral-nemo
			<div class="text-gray-500 dark:text-gray-400 text-xs">Variant tailored for conversational AI applications, focusing on generating human-like dialogue and understanding context.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-saba-2502">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-saba-2502 logo">
			</div>
			<div>
			mistral-saba-2502
			<div class="text-gray-500 dark:text-gray-400 text-xs">A specialized model focused on specific language tasks, leveraging advanced techniques for improved contextual understanding and response generation.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-large-2411">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-large-2411 logo">
			</div>
			<div>
			mistral-large-2411
			<div class="text-gray-500 dark:text-gray-400 text-xs">An iteration of the large model, designed to deliver state-of-the-art performance across various natural language processing benchmarks.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-small-2409">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-small-2409 logo">
			</div>
			<div>
			mistral-small-2409
			<div class="text-gray-500 dark:text-gray-400 text-xs">An updated small model variant that improves upon its predecessor with enhanced training techniques for better performance in lightweight applications.</div>
			</div>
			</div>
			</div>
			</div>

			<!--Mistarl Coding models Seperator-->
			<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
			<div class="flex-1 h-px bg-gradient-to-r from-[#ffaa00] to-[#00ff00]"></div>
			<div class="px-8">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
			</svg>
			</div>
			<div class="flex-1 h-px bg-gradient-to-r from-[#6aff59] to-[#a7ff19]"></div>
			</div>

			<div class="mx-5 my-2 text-sm text-center font-mono text-[#0094d9] font-semibold">
			<p>Mistral Coding models</p>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="codestral-latest">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="codestral-2501 logo">
			</div>
			<div>
			codestral-latest <sup class="text-green-400 font-bold"><i class="text-sky-500 font-mono">@</i>Recommended</sup>
			<div class="text-gray-500 dark:text-gray-400 text-xs">Latest coding-focused model.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="codestral-mamba-2407">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="codestral-mamba-2407 logo">
			</div>
			<div>
			codestral-mamba-2407
			<div class="text-gray-500 dark:text-gray-400 text-xs">A high-performance coding model designed for rapid code generation and debugging, optimized for software development environments.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="codestral-2501">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="codestral-2501 logo">
			</div>
			<div>
			codestral-2501
			<div class="text-gray-500 dark:text-gray-400 text-xs">An advanced coding-focused model that builds on previous iterations, offering improved performance in programming-related tasks and queries.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="codestral-2502">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="codestral-2505 logo">
			</div>
			<div>
			codestral-2505
			<div class="text-gray-500 dark:text-gray-400 text-xs">An advanced coding-focused model that builds on previous iterations, offering improved performance in programming-related tasks and queries.</div>
			</div>
			</div>
			</div>
			</div>

			<!--Mistarl Vision Seperator-->
			<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
			<div class="flex-1 h-px bg-gradient-to-r from-[#ffaa00] to-[#00ff00]"></div>
			<div class="px-8">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
			</svg>
			</div>
			<div class="flex-1 h-px bg-gradient-to-r from-[#6aff59] to-[#a7ff19]"></div>
			</div>

			<div class="mx-5 my-2 text-sm text-center font-mono text-[#0094d9] font-semibold">
			<p>Mistral Vision models</p>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-small-latest">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-small-latest logo">
			</div>
			<div>
			mistral-small-latest
			<div class="text-gray-500 dark:text-gray-400 text-xs">The latest iteration of the small model, designed to deliver state-of-the-art performance across various natural language processing benchmarks.</div>
			</div>
			</div>
			</div>
			</div>

			<!--Mistarl Vision-->
			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="pixtral-large-2411">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="pixtral-large-2411 logo">
			</div>
			<div>
			pixtral-large-2411
			<div class="text-gray-500 dark:text-gray-400 text-xs">A variant in the MistraVision series, optimized for high-quality image and text processing, suitable for complex visual understanding tasks.</div>
			</div>
			</div>
			</div>
			</div>

			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="pixtral-12b-2409">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="pixtral-12b-2409 logo">
			</div>
			<div>
			pixtral-12b-2409
			<div class="text-gray-500 dark:text-gray-400 text-xs">A variant in the MistraVision family designed for advanced image and text integration tasks, enhancing multimodal applications.</div>
			</div>
			</div>
			</div>
			</div>

			<!--Mistarl Moderation Seperator-->
			<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
			<div class="flex-1 h-px bg-gradient-to-r from-[#ffaa00] to-[#00ff00]"></div>
			<div class="px-8">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
			</svg>
			</div>
			<div class="flex-1 h-px bg-gradient-to-r from-[#00ff26] to-[#0011ff]"></div>
			</div>

			<div class="mx-5 my-2 text-sm text-center font-mono text-[#00aa7f] dark:text-[#00fdba] font-semibold">
			<p>Mistral Moderation models</p>
			</div>
			<!-- Mistral Moderation-->
			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-moderation-2411">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-moderation-2411 logo">
			</div>
			<div>
			mistral-moderation-2411
			<div class="text-gray-500 dark:text-gray-400 text-xs">Focused on content moderation, designed to identify and filter inappropriate or harmful content in text data.</div>
			</div>
			</div>
			</div>
			</div>

			<!--Mistarl Moderation Seperator-->
			<div role="separator" aria-orientation="horizontal" class="mx-5 my-1 flex items-center justify-center">
			<div class="flex-1 h-px bg-gradient-to-r from-[#ff5500] to-[#00d100]"></div>
			<div class="px-8">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-[#00aaff]" fill="b" viewBox="0 0 24 24" class="w-12 h-12 text-purple-500">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-8v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" />
			</svg>
			</div>
			<div class="flex-1 h-px bg-gradient-to-r from-[#5454ff] dark:from-[#aaaaff] to-[#0011ff] dark:to-[#0055ff]"></div>
			</div>

			<div class="mx-5 my-2 text-sm text-center font-mono text-[#aa20ff] dark:text-[#ffaaff] font-semibold">
			<p>Mistral embedding models</p>
			</div>
			<!--Mistral embed -->
			<div role="menuitem" class="flex items-center m-1.5 p-2.5 text-sm cursor-pointer focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 group relative hover:bg-gray-200 dark:hover:bg-zinc-800 focus-visible:bg-zinc-700 radix-state-open:bg-zinc-700 rounded-md py-3 px-3 gap-2.5 border-x-2 border-x-[#00aeff]" tabindex="-1" data-value="mistral-embed">
			<div class="flex grow items-center justify-between gap-2">
			<div class="flex items-center gap-3">
			<div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-300 dark:bg-zinc-700">
			<img class="overflown aspect-square size-6 rounded-full border dark:border-gray-700" src="../assets/mistral-logo.png" alt="mistral-embed logo">
			</div>
			<div>
			mistral-embed
			<div class="text-gray-500 dark:text-gray-400 text-xs">Designed for embedding generation, facilitating the transformation of text into vector representations for downstream machine learning tasks.</div>
			</div>
			</div>
			</div>
			</div>
			</div>
			</div>
			</div>
			</section>
			<section class="absolute right-0 z-5">
			<button id="settings" title="Settings" class="mr-[3vw]">
			<svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-8 w-8 fill-current text-gray-800 dark:text-gray-200 transition-colors duration-200">
			<path d="M19.14 12.936c.06-.437.06-.874 0-1.31l2.007-1.55c.21-.16.27-.44.14-.67l-2.4-4.155c-.12-.21-.36-.29-.57-.21l-2.337 1.017c-.56-.43-1.17-.79-1.83-1.07l-.354-2.6c-.04-.26-.27-.46-.54-.46h-5c-.27 0-.51.2-.54.46l-.354 2.6c-.66.28-1.28.64-1.83 1.07L5.22 5.89c-.21-.08-.45 0-.57.21l-2.4 4.155c-.12.21-.07.51.14.67l2.007 1.55c-.06.437-.06.874 0 1.31l-2.007 1.55c-.21.16-.27.44-.14.67l2.4 4.155c.12.21.36.29.57.21l2.337-1.017c.56.43 1.17.79 1.83 1.07l.354 2.6c.04.26.27.46.54.46h5c.27 0 .51-.2.54-.46l.354-2.6c.66-.28 1.28-.64 1.83-1.07l2.337-1.017c.21-.08.45 0 .57.21l2.4 4.155c.12.21.07.51-.14.67l-2.007 1.55c.06.437.06.874 0 1.31zM12 16a4 4 0 110-8 4 4 0 010 8z"/>
			</svg>
			</button>
			</section>
			</div>
			</header>
			<main class="relative z-5 transition-all duration-500">
			<canvas class="absolute z-0 bg-white bg-opacity-0" id="body-canvas"></canvas>

			<!--Notification Modal Background -->
			<div id="quickaiNotify" class="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 opacity-0 pointer-events-none transition-all duration-500 ease-in-out">
			<!-- Modal Content -->
			<div class="items-center justify-center bg-white dark:bg-gray-950 p-6 rounded-lg shadow-lg w-full max-w-md">
			<!-- Close Button -->
			<button id="closeMessageModal" class="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-gray-600">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			</button>

			<!-- Modal Title -->
			<h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Message</h2>

			<!-- Message Content -->
			<p id="messageContent" class="text-gray-700 dark:text-gray-300">
			Request completed in <span id="timeTaken" class="font-semibold text-blue-600 dark:text-blue-400">5 seconds</span>
			</p>

			<!-- Submit Button -->
			<button class="hidden mt-6 bg-blue-500 text-white p-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
			OK
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			</button>
			</div>
			</div>

			<!-- Error Modal -->
			<div id="errorContainer" role="alert" aria-modal="true" class="hidden fixed top-0 left-0 transform -translate-x-1/2 z-50 opacity-0 pointer-events-none transition-all duration-500 ease-in-out p-4">
			<!-- Modal content -->
			<div class="bg-[#fea97f] p-4 rounded-lg shadow-lg max-w-md w-full">
			<h1 class="text-red-500 text-2xl text-center">Error</h1>
			<div class="bg-red-100 border border-red-300 p-4 text-center">
			<p id="errorArea" class="text-red-700 font-bold">Error during Ai Response</p>
			<div class="flex justify-between gap-2 mt-4">
			<button id="retryBt" title="Retry" aria-label="Retry" class="bg-red-500 text-white p-2 rounded-lg flex gap-2 hover:bg-green-700">
			<svg class="loader spin h-8 w-8 hover:bg-green-400 rounded-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
			<circle cx="25" cy="25" r="20" class="stroke-[#ffaa00]" stroke-width="5" fill="none"/>
			<circle cx="25" cy="25" r="20" class="stroke-blue-500" stroke-width="5" fill="none" stroke-dasharray="31.4" stroke-dashoffset="0">
			<animate attributeName="stroke-dashoffset" from="0" to="360" dur="4s" repeatCount="indefinite" />
			</circle>
			</svg>Retry
			</button>
			<button id="closeEModal" class="bg-gray-500 text-white p-2 rounded-lg justify-end">Close</button>
			</div>
			</div>
			</div>
			</div>


			<!-- Conversation Pane -->
			<div id="conversationPane" class="fixed top-[10vh] h-[90vh] left-0 rounded-r-lg w-fit max-w-[45%] sm:max-w-[40vw] md:max-w-[30vw] lg:max-w-[20vw] bg-teal-900 dark:bg-stone-950 p-4 transform -translate-x-full transition duration-500 ease-in-out z-40 border-r-2 border-y-2 border-sky-300 dark:border-gray-600 shadow-md overflow-hidden">
			<section class="fixed w-full bg-indigo-800 dark:bg-cyan-950 mb-8 left-0 top-[0vh] z-50">
			<div class="relative flex space-x-2 w-full">
			<h2 class="text-2xl p-1 font-bold bg-gradient-to-r from-blue-400 to-pink-400 dark:from-cyan-400 dark:to-cyan-400 bg-clip-text text-transparent">Chats</h2>
			<button id="new-chat" title="Open New Chat" aria-label="open new conversation" class="absolute top-2 right-5 font-bold dark:text-sky-500">
			<svg class="w-6 h-6 pulse-hover stroke-white dark:stroke-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"  stroke-width="2">
			<!-- Pen/pencil Cover -->
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
			</svg>
			</button>
			</div>
			<hr>
			</section>
			<div id="conversations" class="h-[calc(90vh-72px)] overflow-y-auto mb-2 w-full space-y-2 mt-7 overflow-x-hidden">
			<!-- Conversation items will be added here -->
			</div>
			</div>

			<!-- Copied feedback modal -->
			<div id="copyModal" class="fixed top-0 left-1/2 transform -translate-x-1/2 w-4/5 max-w-md bg-white dark:bg-zinc-700 text-gray-800 dark:text-gray-100 p-4 shadow-md rounded text-center z-50 opacity-0 pointer-events-none transition-all duration-500 ease-in-out">
			<div class="flex items-center justify-center">
			<svg class="w-6 h-6 text-green-500 dark:text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
			<p id="text-space" class="text-lg">Text copied</p>
			</div>
			</div>

			<!-- Chat Area -->
			<section id="chatArea" class="bg-gray-50 dark:bg-stone-900 h-[75vh] p-2 shadow-inner shadow-gray-400 dark:shadow-none md:p-4 rounded-lg  dark:shadow-gray-950 overflow-y-auto overflow-x-hidden space-y-4 transition-colors duration-1000">

			<!-- Quick query options -->
			<section id='suggestions' class="mx-auto">
			<div class="justify-center mt-[var(--screen-optical-compact-offset-amount)] flex h-full flex-shrink flex-col items-center overflow-hidden text-token-text-primary" style="opacity: 1; will-change: auto;">
			<div class="relative inline-flex justify-center text-center text-2xl font-semibold leading-9 dark:text-white transition-colors duration-1000">
			<h1>What can I help you with? </h1><h1 class="result-streaming absolute left-full transition-opacity" style="opacity: 0;"><span></span></h1>
			</div>
			<div class="h-fit" style="opacity: 1; will-change: auto;">
			<div class="mt-5 flex items-center justify-center gap-x-2 transition-opacity duration-700 xl:gap-x-2.5 opacity-100 flex-wrap">
			<ul id="SQ-UL" class="relative flex items-stretch gap-x-2 gap-y-4 overflow-hidden py-2 sm:gap-y-2 xl:gap-x-2.5 xl:gap-y-2.5 flex-wrap justify-center">
			<li id="create-image" class="SG" style="opacity: 1; will-change: auto; transform: none;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" style="color: rgb(53, 174, 71);"><path d="M4.5 17.5L7.56881 14.3817C8.32655 13.6117 9.55878 13.5826 10.352 14.316L16.5 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19 12H18.3798C17.504 12 16.672 11.6173 16.102 10.9524L11.898 6.04763C11.328 5.38269 10.496 5 9.6202 5H6C4.89543 5 4 5.89543 4 7V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><path d="M19 5H18.3798C17.504 5 16.672 5.38269 16.102 6.04763L14 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"></circle><path d="M18 14V10C18 9.58798 18.4704 9.35279 18.8 9.6L21.4667 11.6C21.7333 11.8 21.7333 12.2 21.4667 12.4L18.8 14.4C18.4704 14.6472 18 14.412 18 14Z" fill="currentColor"></path><path d="M18 7V3C18 2.58798 18.4704 2.35279 18.8 2.6L21.4667 4.6C21.7333 4.8 21.7333 5.2 21.4667 5.4L18.8 7.4C18.4704 7.64721 18 7.41202 18 7Z" fill="currentColor"></path></svg><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">Create image</span></button>
			</li>
			<li id="get-advice" class="SG" style="opacity: 1; will-change: auto; transform: none;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" style="color: rgb(118, 208, 235);"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.4544 4.10451C13.1689 3.95886 12.8309 3.95886 12.5455 4.10451L2.98609 8.98175L2.07715 7.20022L11.6365 2.32298C12.493 1.88603 13.5069 1.88603 14.3634 2.32298L23.9227 7.20022C24.7332 7.61373 25.091 8.44008 24.9999 9.2194V15C24.9999 15.5523 24.5522 16 23.9999 16C23.4477 16 22.9999 15.5523 22.9999 15V11.2156L20.9666 12.2115V16.3052C20.9666 17.409 20.3605 18.4237 19.3885 18.9468L14.4219 21.6203C13.5341 22.0981 12.4657 22.0981 11.578 21.6203L6.61135 18.9468C5.63941 18.4237 5.03328 17.409 5.03328 16.3052V12.2115L2.10635 10.7779C0.626202 10.0529 0.609039 7.94926 2.07715 7.20022L2.98608 8.98175L12.5601 13.671C12.8376 13.807 13.1623 13.807 13.4398 13.671L23 8.9885C23.0001 8.98394 23.0001 8.97938 23.0003 8.97483L13.4544 4.10451ZM7.03328 13.1911V16.3052C7.03328 16.6732 7.23532 17.0114 7.5593 17.1858L12.526 19.8592C12.8219 20.0185 13.178 20.0185 13.4739 19.8592L18.4406 17.1858C18.7646 17.0114 18.9666 16.6732 18.9666 16.3052V13.1911L14.3195 15.4672C13.4871 15.8749 12.5128 15.8749 11.6803 15.4672L7.03328 13.1911Z" fill="currentColor"></path></svg><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">Get advice</span></button>
			</li>
			<li id="summarize" class="SG" style="opacity: 1; will-change: auto; transform: none;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" style="color: rgb(234, 132, 68);"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 5C4 3.34315 5.34315 2 7 2H14.1716C14.9672 2 15.7303 2.31607 16.2929 2.87868L19.1213 5.70711C19.6839 6.26972 20 7.03278 20 7.82843V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V5ZM7 4C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V7.82843C18 7.56321 17.8946 7.30886 17.7071 7.12132L14.8787 4.29289C14.6911 4.10536 14.4368 4 14.1716 4H7ZM8 10C8 9.44772 8.44772 9 9 9H15C15.5523 9 16 9.44772 16 10C16 10.5523 15.5523 11 15 11H9C8.44772 11 8 10.5523 8 10ZM8 14C8 13.4477 8.44772 13 9 13H13C13.5523 13 14 13.4477 14 14C14 14.5523 13.5523 15 13 15H9C8.44772 15 8 14.5523 8 14Z" fill="currentColor"></path></svg><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">Summarize text</span></button>
			</li>
			<li id="suprise" class="SG" style="opacity: 1; will-change: auto; transform: none;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" style="color: rgb(118, 208, 235);"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.9969 3.39017C14.5497 2.17402 15.961 1.60735 17.2013 2.10349L19.4044 2.98475C20.7337 3.51645 21.3458 5.05369 20.7459 6.35358L19.0629 10H20C20.5523 10 21 10.4477 21 11V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V11C3 10.4504 3.44331 10.0044 3.99183 10L3.84325 9.89871C3.83307 9.89177 3.82303 9.88465 3.81311 9.87733C2.55917 8.9526 2.79737 7.01262 4.23778 6.41871L6.35774 5.5446L7.08184 3.36883C7.57382 1.8905 9.49246 1.51755 10.5024 2.70393L11.9888 4.45002L13.5103 4.46084L13.9969 3.39017ZM15.5096 4.89554C16.2552 5.48975 16.5372 6.59381 15.9713 7.51403L14.8266 9.37513C14.8265 9.38763 14.8266 9.40262 14.8273 9.42012C14.8294 9.47125 14.8357 9.52793 14.8451 9.58262C14.8548 9.63855 14.8654 9.67875 14.8714 9.69773C14.9032 9.79819 14.9184 9.89994 14.9184 10H16.8602L18.93 5.51547C19.0499 5.25549 18.9275 4.94804 18.6617 4.8417L16.4585 3.96044C16.2105 3.86122 15.9282 3.97455 15.8176 4.21778L15.5096 4.89554ZM12.8885 10C12.8572 9.84122 12.8358 9.66998 12.8289 9.50115C12.8194 9.26483 12.8254 8.81125 13.0664 8.41953L14.2677 6.46628L11.9746 6.44997C11.3934 6.44584 10.8427 6.18905 10.4659 5.74646L8.97951 4.00037L8.25541 6.17614C8.07187 6.72765 7.65748 7.17203 7.12012 7.39359L5.00091 8.26739L7.06338 9.67378C7.19188 9.7614 7.29353 9.87369 7.3663 10H12.8885ZM5 12V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V12H5ZM9.5 14.5C9.5 13.9477 9.94771 13.5 10.5 13.5H13.5C14.0523 13.5 14.5 13.9477 14.5 14.5C14.5 15.0523 14.0523 15.5 13.5 15.5H10.5C9.94771 15.5 9.5 15.0523 9.5 14.5Z" fill="currentColor"></path></svg><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">Surprise me</span></button>
			</li>
			<div id="more" class="inline-block" style="opacity: 1; will-change: auto; transform: none;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">More</span></button>
			</div>
			<li id="code" class="extra hidden SG" style="opacity: 1; will-change: auto;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" style="color: rgb(108, 113, 255);"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 6C3 4.34315 4.34315 3 6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6ZM6 5C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V6C19 5.44772 18.5523 5 18 5H6ZM7.29289 9.29289C7.68342 8.90237 8.31658 8.90237 8.70711 9.29289L10.7071 11.2929C11.0976 11.6834 11.0976 12.3166 10.7071 12.7071L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071C6.90237 14.3166 6.90237 13.6834 7.29289 13.2929L8.58579 12L7.29289 10.7071C6.90237 10.3166 6.90237 9.68342 7.29289 9.29289ZM12 14C12 13.4477 12.4477 13 13 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H13C12.4477 15 12 14.5523 12 14Z" fill="currentColor"></path></svg><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">Code</span></button>
			</li>
			<li id="analyze-images" class="extra hidden SG" style="opacity: 1; will-change: auto;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" style="color: rgb(108, 113, 255);"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.91444 7.59106C4.3419 9.04124 3.28865 10.7415 2.77052 11.6971C2.66585 11.8902 2.66585 12.1098 2.77052 12.3029C3.28865 13.2585 4.3419 14.9588 5.91444 16.4089C7.48195 17.8545 9.50572 19 12 19C14.4943 19 16.518 17.8545 18.0855 16.4089C19.6581 14.9588 20.7113 13.2585 21.2295 12.3029C21.3341 12.1098 21.3341 11.8902 21.2295 11.6971C20.7113 10.7415 19.6581 9.04124 18.0855 7.59105C16.518 6.1455 14.4943 5 12 5C9.50572 5 7.48195 6.1455 5.91444 7.59106ZM4.55857 6.1208C6.36059 4.45899 8.84581 3 12 3C15.1542 3 17.6394 4.45899 19.4414 6.1208C21.2384 7.77798 22.4152 9.68799 22.9877 10.7438C23.4147 11.5315 23.4147 12.4685 22.9877 13.2562C22.4152 14.312 21.2384 16.222 19.4414 17.8792C17.6394 19.541 15.1542 21 12 21C8.84581 21 6.36059 19.541 4.55857 17.8792C2.76159 16.222 1.58478 14.312 1.01232 13.2562C0.58525 12.4685 0.585249 11.5315 1.01232 10.7438C1.58478 9.688 2.76159 7.77798 4.55857 6.1208ZM12 9.5C10.6193 9.5 9.49999 10.6193 9.49999 12C9.49999 13.3807 10.6193 14.5 12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5ZM7.49999 12C7.49999 9.51472 9.51471 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51471 16.5 7.49999 14.4853 7.49999 12Z" fill="currentColor"></path></svg><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">Analyze images</span></button>
			</li>
			<li id="help-me-write" class="extra hidden SG" style="opacity: 1; will-change: auto;">
			<button class="relative flex h-[42px] items-center gap-1.5 rounded-full border border-token-border-light px-3 py-2 text-start text-[13px] shadow-md transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md" style="color: rgb(203, 139, 208);"><path d="M3 6H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M3 10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="M13.4282 17.5718L20.5 10.5C21.6046 9.39543 21.6046 7.60457 20.5 6.5C19.3954 5.39543 17.6046 5.39543 16.5 6.5L9.42819 13.5718C9.14899 13.851 8.95868 14.2066 8.88124 14.5938L8 19L12.4062 18.1188C12.7934 18.0413 13.149 17.851 13.4282 17.5718Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="max-w-full select-none whitespace-nowrap text-gray-600 transition group-hover:text-token-text-primary dark:text-gray-500">Help me write</span></button>
			</li>
			</ul>
			</div>
			</div>
			</section>
			</section>


			<!--scroll to bottom-->
			<button id="scroll-bottom" class="hidden z-40 cursor-pointer absolute rounded-full bg-fuchsia-400 border border-blue-400 dark:border-gray-300 dark:bg-white right-1/2 translate-x-1/2 shadow w-8 h-8 flex items-center justify-center bottom-[6%] md:bottom-[4%] transition-colors duration-1000" title="scroll👇" aria-label="scroll to bottom">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md text-token-text-primary"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path>
			</svg>
			</button>

			<!-- User Message Input Section -->
			<div class="fixed flex left-0 lg:left-auto w-full lg:items-center lg:justify-center z-30 bottom-[1%] transition-all duration-1000">
			<section class="relative w-full lg:w-[70vw] flex space-x-4 z-30 transition-all duration-700">
			<!-- Custom input field -->
			<div id="userInput"
			contenteditable="true"
			role="textbox"
			aria-label="Message input"
			autofocus
			data-placeholder="Message QuickAi 💫 To generate an image, start with \`/image\`"
			oninput="this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 28 * window.innerHeight / 100) + 'px'; this.scrollTop = this.scrollHeight;"
			value="this.textContent()"
			class="w-full overflow-auto scrollbar-hide py-1 px-[4%] md:py-3 md:pl-[2%] md:pr-[7%] border border-teal-400 dark:border-teal-600 rounded-lg focus:outline-none dark:outline-teal-600 focus:border-2 bg-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 dark:text-white max-h-[28vh] pb-2 transition-all duration-1000"></div>

			<section class="absolute right-[0.5px] bottom-0 p-1 flex w-full rounded-b-md dark:border-teal-600 shadow-xl">
			<!-- Tools section (Attach Files and Preview) -->
			<div class="flex px-3">
			<div id="AttachFiles" class="flex rounded-lg" title="Attach files">
			<button aria-label="Attach files" class="flex items-center justify-center h-8 w-8 rounded-lg rounded-bl-xl text-token-text-primary dark:text-white dark:hover:text-blue-400 focus-visible:outline-black dark:focus-visible:outline-white hover:bg-black/20">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z" fill="currentColor"></path>
			</svg>
			</button>
			</div>
			</div>

			<div class="flex space-x-2">
			<div style="view-transition-name: var(--vt-composer-reason-action);">
			<div>
			<!-- Toggle button with aria-pressed to indicate state -->
			<button id="previewBtn"
			class="flex h-9 min-w-8 items-center justify-center rounded-full border p-2 text-[13px] font-medium
			border-sky-900 bg-blue-100 hover:bg-sky-300 dark:border-[#aa55ff] dark:bg-[#171717] dark:hover:bg-[#225]
			text-gray-900 dark:text-white transition-colors duration-1000"
			aria-pressed="false"
			aria-label="Preview">
			<div class="h-[18px] w-[18px]">
			<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path class="fill-current"
			d="M12 3c-3.585 0-6.5 2.9225-6.5 6.5385 0 2.2826 1.162 4.2913 2.9248 5.4615h7.1504c1.7628-1.1702 2.9248-3.1789 2.9248-5.4615 0-3.6159-2.915-6.5385-6.5-6.5385zm2.8653 14h-5.7306v1h5.7306v-1zm-1.1329 3h-3.4648c0.3458 0.5978 0.9921 1 1.7324 1s1.3866-0.4022 1.7324-1zm-5.6064 0c0.44403 1.7252 2.0101 3 3.874 3s3.43-1.2748 3.874-3c0.5483-0.0047 0.9913-0.4506 0.9913-1v-2.4593c2.1969-1.5431 3.6347-4.1045 3.6347-7.0022 0-4.7108-3.8008-8.5385-8.5-8.5385-4.6992 0-8.5 3.8276-8.5 8.5385 0 2.8977 1.4378 5.4591 3.6347 7.0022v2.4593c0 0.5494 0.44301 0.9953 0.99128 1z"
			clip-rule="evenodd" fill-rule="evenodd"></path>
			</svg>
			</div>
			<div class="whitespace-nowrap pl-1 pr-1">Preview</div>
			</button>
			</div>
			</div>
			<button id="microphone" class="mx-2">
			<svg id="microphoneSVG" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" class="stroke-blue-600 dark:stroke-cyan-400 hover:stroke-sky-800 dark:hover:stroke-sky-200 w-6 h-6 transition-colors duration-1000">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
			</svg>
			</button>

			<!-- Toolbar button with SVG icon -->
			<button
			id='diagToggle'
			class="px-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-300 bg-blue-200 dark:bg-teal-700 rounded-md"
			aria-label="Open Diagram modal"
			title="Open Diagram modal">
			<!-- SVG: Nodes/Flow Diagram -->
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-8 text-gray-800 dark:text-gray-100 transition-colors duration-1000" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<circle cx="5" cy="12" r="2" stroke-width="2" />
			<circle cx="12" cy="5" r="2" stroke-width="2" />
			<circle cx="12" cy="19" r="2" stroke-width="2" />
			<circle cx="19" cy="12" r="2" stroke-width="2" />
			<path d="M7 12h4M13 5v2M13 19v-2M17 12h-4" stroke-width="2" stroke-linecap="round" />
			</svg>
			</button>
			<!--Image Generation Toggle tool-->
			<button id="image-gen" class="flex items-center justify-center text-sm font-medium ring-offset-background transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-none hover:bg-blue-300 hover:text-white dark:hover:bg-zinc-900 dark:hover:text-slate-200 h-8 rounded-lg gap-2 text-black dark:text-white px-2 py-3 focus:ring-none" type="button" aria-pressed="false" aria-label="Image Gen">
			<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-black dark:text-white">
			<path d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>
			</svg>
			<span class="text-xs text-black dark:text-white">Image Gen</span>
			</button>
			<!-- Triple Ripple with Gradient Border -->
			<button id="sendBtn" class="absolute right-2 h-14 w-14 bottom-4 rounded-full transition-all ease-in-out duration-1000 z-32 bg-white border border-gray-200 bg-gradient-to-br from-[#00246c] dark:from-[#a800fc] to-[#008dd3] dark:to-indigo-900 overflow-hidden" aria-label="Send message" title="Send message">
			<div id="normalSend" class=" flex items-center justify-center h-full w-full">
			<!-- Alternative Send Icon with a warm gradient -->
			<svg class="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<defs>
			<linearGradient id="planeGradient2" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0%" stop-color="#ff8a65" />
			<stop offset="100%" stop-color="#ff7043" />
			</linearGradient>
			</defs>
			<path fill="url(#planeGradient2)" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
			</svg>
			</div>
			<div id="spinningSquares" class="hidden absolute inset-0 flex items-center justify-center">
			<span class="ripple-single-1 ripple-single-1"></span>
			<span class="ripple-single-2 ripple-single-2"></span>
			<span class="ripple-single-3 ripple-single-3"></span>
			</div>
			</button>
			</div>

			</section>

			</section>
			</div>

			<!--Recording modal-->
			<div id="recordingModal" class="hidden fixed inset-0 z-50 bg-blue-400/20 overflow-y-auto">
			<div class="relative flex items-center justify-center min-h-screen">
			<canvas class="absolute md:max-w-md lg:max-w-lg xl:max-w-xl md:max-h-md lg:max-h-lg xl:max-h-xl z-1 bg-white dark:bg-slate-950 rounded-lg shadow-lg transition-colors duration-1000" id="canvas"></canvas>
			<section class="absolute z-10">
			<div class="relative px-4 w-full max-w-md">
			<div class="bg-opacity-0">
			<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b-2 border-gray-300 dark:border-sky-400 pb-2 italic transition-colors duration-1000">Recorder</h2>
			<div class="p-6">
			<div class="flex items-center justify-center">
			<span id="recordingTime" class="text-3xl text-blue-500 dark:text-white font-bold transition-colors duration-1000">00:00:00</span>
			</div>

			<div class="flex justify-center mt-6 space-x-4">
			<button id="pauseButton" class="hidden bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
			<!--pause svg disabled when not recording-->
			<svg id="pauseIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
			</svg>
			</button>
			<button id="startButton" class="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
			<!--start svg -->
			<svg class="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
			<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
			</svg>
			</button>

			<button id="finishButton" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full size-14 cursor-not-allowed transition-colors duration-1000">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			</button>

			<button id="cancelButton" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full size-14 transition-colors duration-1000">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-6 h-6">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
			</button>
			</div>
			</div>
			</div>
			</div>
			</section>
			</div>
			</div>

			<div id="dropZoneModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-40 hidden z-40 transition-colors duration-1000">
			<section id="dropZoneContent" title="Attach files" class="relative p-3 bg-white dark:bg-stone-800 rounded-xl shadow-lg w-full h-full md:mx-auto max-w-[70vw] max-h-[70vh] md:max-h-[80vh] lg:md:max-w-[50vw] mb-16 transition-colors duration-1000" >
			<button id="closeFileEModal" title="Close" class="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 transition-colors duration-1000">
			<svg class="fill-current h-5 w-5" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.65-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"></path>
			</svg>
			</button>
			<h2 class="text-2xl font-semibold text-blue-700 dark:text-sky-300 mb-6">Upload File</h2>
			<div id="dropZone" class="p-4 rounded-xl border-2 border-dashed border-blue-400 dark:border-cyan-400 w-full h-full md:mx-auto max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh] cursor-pointer transition-colors duration-1000" onclick="event.stopPropagation()">
			<div class="flex flex-col items-center justify-center h-full">
			<div id="dropZoneSVG" class="flex items-center justify-center">
			<svg class="fill-current h-12 w-12 text-blue-400 dark:text-blue-300 transition-colors duration-1000" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
			<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
			<path d="M14 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z"></path>
			</svg>
			</div>
			<p id="dropZoneText" class="text-gray-600 dark:text-gray-300 text-lg mb-4 transition-colors duration-1000">Drag & drop files here or <span class="text-cyan-400 dark:text-blue-400">click to select</span></p>
			<!-- Modal Trigger Button -->
			<button id="modalTrigger" onclick="document.getElementById('previewModal').classList.remove('hidden')" class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-colors duration-1000 focus:outline-none focus:ring-2 focus:ring-purple-400">
			<svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
			Preview Files
			</button>
			</div>
			</div>
			<section class="w-[calc(70vw-30px)] lg:max-w-[calc(50vw-30px)] absolute bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 dark:bg-gradient-to-r dark:from-purple-800 dark:via-pink-800 dark:to-indigo-800 flex space-x-2 bottom-3 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 transition-colors duration-1000">
			<textarea type="text" aria-label="prompt input field" title="prompt field" id="imagePrompt" class="w-full pt-2 scrollbar-hide resize-none text-black dark:text-white max-h-[10vh] overflow-wrap rows-2 bg-transparent focus:outline-none" oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';" placeholder="Enter your prompt here"></textarea>
			<div class="flex items-center justify-end">
			<button id="submitImage" aria-label="submit button" title="submit" class="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg focus:outline-none hover:from-blue-600 hover:to-purple-700 w-fit">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3z" clip-rule="evenodd" />
			</svg>
			</button>
			</div>
			</section>
			</section>
			</div>

			<!-- Modal Structure -->
			<div id="previewModal" class="hidden fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out">
			<div class="relative p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl md:mx-auto min-w-[30vw] max-w-[calc(70vw-30px)] max-h-[calc(70vh-20vh)] md:max-h-[calc(80vh-20vh)] overflow-hidden transform transition-transform duration-300 ease-out scale-95 transition-colors duration-1000" id="modalContent">
			<h2 class="text-2xl font-semibold text-blue-600 dark:text-sky-400 mb-1 transition-colors duration-1000">Preview Files</h2>
			<div class="overflow-hidden">
			<div id="uploadedFiles" class="pb-4 mb-2 rounde-lg dark:bg-[#002a3d] p-2 space-y-3 max-h-[calc(60vh-100px)] overflow-y-auto scrollbar-hide transition-colors duration-1000">
			<p class="font-bold mb-12 px-12 text-cyan-600 dark:text-teal-400 transition-colors duration-1000">No files uploaded yet.</p>
			</div>
			</div>
			<div class="absolute bottom-0 right-0.5 z-60 w-24 p-2 border-t border-gray-200 dark:border-[#4d7339] flex justify-end v">
			<button id="closeModal" onclick="document.getElementById('previewModal').classList.add('hidden')" class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 text-white font-semibold py-2 px-5 rounded-full shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-1000">
			Close
			</button>
			</div>
			</div>
			</div>

			<input multiple class="absolute opacity-0" accept=".txt, .doc, .docx, .rtf, .md, .markdown, .epub, .mobi, .pdf, .png, .jpg, .jpeg, .svg, .gif, .bmp" type="file" id="fileInput" onclick="handleFileInputClick();"/>

			<!-- Conversation options -->
			<!-- Background Overlay -->
			<div id="chatOptions-overlay" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 hidden w-full h-full">

			<!-- Main Modal -->
			<div id="chatOptions" class="fixed flex inset-0 items-center justify-center rounded-lg shadow-xl z-50 animate-exit">
			<div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full bg-gradient-to-r from-blue-400 to-sky-400">
			<div class="text-center">
			<h2 class="text-2xl font-semibold text-gray-800 mb-6">Options</h2>
			<section class="grid grid-rows-2 space-y-4">
			<div class="flex flex-row justify-center space-x-4">
			<button id="renameOption" class="bg-blue-800 text-white p-1 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
			Rename
			</button>
			<button id="DeleteOption" class="bg-red-500 text-white p-2 rounded-lg w-full shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
			Delete
			</button>
			</div>
			<div class="items-center">
			<button id="renameOptionsBt" class="bg-gray-300 text-gray-700 mt-4 p-3 rounded-lg w-fit shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
			Cancel
			</button>
			</div>
			</section>
			</div>
			</div>
			</div>

			<div id="confirm-delete-modal" class="fixed inset-0 w-full h-full bg-black/30 flex items-center justify-center overflow-y-auto z-50 -translate-x-full transition-transform duration-700 ease-in-out transform">
			<div id="confirm-delete-box" class="bg-white text-center p-4 rounded-lg shadow-xl max-w-md">
			<h2 class="text-2xl font-semibold text-gray-800 mb-6">Confirm Deletion</h2>
			<p class="text-gray-700 mb-4">Are you sure you want to delete this item?</p>
			<div class="flex justify-between space-x-4">
			<button id="CancelDeleteBt" class="bg-blue-500 text-white p-3 rounded-lg w-1/2 shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
			Cancel
			</button>
			<button id="ConfirmDelete" class="bg-red-500 text-white p-3 rounded-lg w-1/2 shadow-sm transition duration-300 ease-in-out transform hover:scale-105">
			Delete
			</button>
			</div>
			</div>
			</div>
			</div>

			<!--Conversation Rename modal-->
			<div id="renameModal" class="fixed inset-0 z-50 flex translate-y-full items-center justify-center bg-black bg-opacity-40 transform transition-transform duration-700 ease-in-out">
			<div class="bg-white p-6 rounded-lg shadow-lg">
			<h3 id="modalTitle" class="text-2xl font-bold text-gray-800 mb-4"></h3>
			<div class="mb-4">
			<label for="newName" class="block text-gray-700 mb-2">New Name:</label>
			<input type="text" id="newName" class="w-full p-2 border rounded" placeholder="Enter new name">
			</div>
			<div class="flex justify-end space-x-4">
			<button id="SubmitRenameButton" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Rename</button>
			<button id="canceRenamelButton" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
			</div>
			</div>
			</div>

			<!-- Settings Modal Background -->
			<div id="settingsModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 dark:bg-opacity-40 dark:bg-gray-900 transition-colors duration-1000" onclick="if (event.target.id === 'settingsModal') {this.classList.add('hidden');}">
			<!-- Modal Content -->
			<div class="relative bg-[#ffaa7f] border-2 border-gray-200 dark:bg-[#171f30] dark:border-2 dark:border-[#28636f] dark:shadow-lg dark:shadow-[#22242e] shadow-xl p-6 rounded-lg w-full mx-2 md:mx-auto max-w-md lg:max-w-xl xl:max-w-2xl max-h-full transition-colors duration-1000">

			<!-- Close Button -->
			<button id="closeModal" onclick="document.getElementById('settingsModal').classList.add('hidden')" class="absolute top-2 right-2 text-[#00557f] dark:text-[#00ffff] hover:text-gray-900 hover:rotate-45 transform duration-300 dark:hover:text-gray-400">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			</button>

			<!-- Modal Title -->
			<h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Settings</h2>

			<!--Scrollable content container-->
			<section class="bg-[#fdfdfd]  dark:bg-zinc-800 overflow-auto max-h-[80vh] shadow-inner-md border-2 border-[#8f45ff] dark:border-[#2b3a59] rounded-md p-2 transition-colors transform duration-600">

			<section class="mb-4 space-y-1" arial-label="Control Stection" title="Control Section">
			<section class="grid grid-cols-2 grid-rows-2 md:grid-cols-3 mb-4 space-y-3">
			<!-- Theme Switching Option -->
			<div class="flex items-center">
			<label for="themeSwitch" class="text-gray-700 dark:text-gray-200">Theme</label>
			<label class="relative inline-flex items-center cursor-pointer">
			<input id="themeSwitch" type="checkbox" class="sr-only peer">
			<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
			</label>
			</div>

			<!-- AutoScroll option -->
			<div class="flex items-center" title="scroll on content" aial-label="scroll on content">
			<label for="AutoScroll" class="text-gray-700 dark:text-gray-200">Auto scroll</label>
			<label class="relative inline-flex items-center cursor-pointer">
			<input id="AutoScroll" checked type="checkbox" class="sr-only peer">
			<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
			</label>
			</div>
			<!-- Image Generation model change -->
			<div class="flex items-center">
			<label class="relative inline-flex items-center cursor-pointer text-gray-700 dark:text-gray-200">Use Flux</label>
			<label class="relative inline-flex items-center cursor-pointer" title="Change image generation model to FLUX">
			<input id="CModel" type="checkbox" class="sr-only peer">
			<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
			</label>
			</div>

			<!-- Body/ChatArea Animation Control Option -->
			<div class="flex items-center" arial-label="Toggle spinning spher balls animation in the ChatArea" title="Toggle spinning spher balls animation in the ChatArea">
			<label for="themeSwitch" class="text-gray-700 dark:text-gray-200">Animation</label>
			<label class="relative inline-flex items-center cursor-pointer">
			<input id="animation-toggle" id="themeSwitch" type="checkbox" class="sr-only peer">
			<div id="animation-toggle-peer" class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
			</label>
			</div>
			</section>
			</section>

			<!--Misceleneous-->

			<div id="pref-inputSection" class="mb-6">
			<label for="recommendations" class="block text-lg font-medium mb-2 text-gray-600 dark:text-gray-300 flex items-center transition-colors duration-1000">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m4 0h1M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
			</svg>
			Enter Your &nbsp;<i> <span class="text-orange-500">wish</span></i> /<span class="text-pink-500"> infor</span>/<span class="text-purple-500"> preference</span>:
			</label>
			<section title="What would you like quickai to know about you? Tell me what you would want me to do for you and in what manner?" class="w-full rounded-lg border-2 border-blue-500 dark:border-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-700 transition-colors duration-1000">
			<textarea id="pref-input" class="scrollbar-hide resize-none overflow-wrap w-full text-rose-950 dark:text-white pt-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 ring-none outline-none transition-colors duration-1000" placeholder="What would you like quickai to do or know about you?..." oninput="this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 28 * window.innerHeight / 100) + 'px'; this.scrollTop = this.scrollHeight;"></textarea>
			<div class="flex justify-end">
			<!-- Checkmark Circle Icon Button -->
			<button id="pref-submit" class="bg-green-500 hover:bg-yellow-500 text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-1000">
			Submit
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			</button>
			</div>
			</section>
			</div>

			<div id="pref-section" class="mb-6">
			<label class="block text-lg font-medium mb-2 text-gray-600 dark:text-gray-300 flex items-center ml-2 transition-colors duration-1000">
			User &nbsp;<span class="text-sky-500">command</span> &nbsp;/ &nbsp;<span class="text-pink-900 font-semibold">Data</span>
			</label>
			<div id="pref-preview" class="relative p-6 bg-blue-200 dark:bg-stone-900 border-none border-blue-300 rounded-lg shadow-md shadow-gray-700 transition-colors duration-1000">
			<p id="pref-content" class="text-gray-800 dark:text-orange-400 transition-colors duration-1000"></p>
			<section class="absolute top-0.5 right-1 flex flex-col space-y-2">
			<button id="pref-delete" aria-label="Delete preference" title="Delete preference" class="rounded-md p-1 bg-slate-600 dark:bg-gray-800 text-red-400 hover:text-red-500 shadow-md transition-colors duration-1000">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.981-1.858L5 7m5 4v6m4-6v6"></path>
			</svg>
			</button>
			<button id="pref-edit" aria-label="Edit" title="Edit" class="p-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md transition-colors duration-1000">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
			</svg>
			</button>
			</section>
			</div>
			</div>

			<!-- Additional Settings Options -->
			<div class="flex justify-center w-full my-4">
			<button onclick="showApiManModal()" class="px-6 py-3 rounded-lg bg-blue-500 dark:bg-black border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors duration-1000">
			<span class="bg-gradient-to-r from-[#ffff7f] via-[#550000] to-[#0000ff] text-transparent bg-clip-text font-bold">
			Manage API Key
			</span>
			</button>
			</div>


			<div class="mb-4">
			<label class="block text-gray-700 dark:text-gray-300 mb-2">Language:</label>
			<select class="form-select w-fit font-bold bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 transition-colors duration-1000">
			<option value="en" class="text-yellow-400 font-bold">English</option>
			<option value="fr">French</option>
			<option value="es">Spanish</option>
			</select>
			</div>

			<!-- Save Settings Button -->
			<section class="w-full flex justify-center">
			<button id="saveSettings" class="w-fit bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-1000">
			Save Settings
			</button>
			</section>
			</section>
			</div>
			</div>


			<!-- API KEY Modal -->
			<div id="apiKeyModal" class="fixed inset-0 bg-blue-900/40 dark:bg-zinc-900/80 flex items-center justify-center z-30 hidden transition-colors duration-1000">
			<div id="apiKeyModalContent" class="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-2xl w-96 fade-in">
			<h2 class="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 transition-colors duration-1000">
			Enter Your API Keys
			</h2>
			<div class="mt-4 space-y-4">
			<div class="space-y-2">
			<label for="mistralKey" class="block text-gray-700 dark:text-gray-300 transition-colors duration-1000">Mistral API Key</label>
			<div class="relative">
			<input id="mistralKey" type="password" class="w-full p-2 border border-orange-400 dark:border-blue-300 rounded-md dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors duration-1000">
			<button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400" onclick="toggleVisibility('mistralKey')">
			👁
			</button>
			</div>
			</div>
			<div class="space-y-2">
			<label for="huggingfaceKey" class="block text-gray-700 dark:text-gray-300 transition-colors duration-1000">Hugging Face API Key</label>
			<div class="relative">
			<input id="huggingfaceKey" type="password" class="w-full p-2 border border-pink-400 rounded-md dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-colors duration-1000">
			<button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 transition-colors duration-1000" onclick="toggleVisibility('huggingfaceKey')">
			👁
			</button>
			</div>
			</div>
			</div>
			<div class="flex justify-end mt-6 space-x-3">
			<button class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition" onclick="closeApiQueryModal()">
			Cancel
			</button>
			<button id="saveKeysBt" class="px-4 py-2 bg-blue-600 text-white rounded-md dark:hover:bg-blue-700 hover:bg-green-600 transition" onclick="saveKeys()">
			Save
			</button>
			</div>
			</div>
			</div>
			</div>

			<!--Key management modal-->
			<div id="apiKeyManPage" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 translate-y-full transition-all duration-700">
			<div class="relative w-fit max-w-3xl mx-auto bg-white dark:bg-stone-800 p-6 rounded-lg shadow-lg aimate-fadeIn overflow-hidden">
			<!-- Close Button -->
			<button id="closeModalManPage" class="absolute top-2 right-2 text-black dark:text-blue-400 hover:text-gray-900 hover:rotate-45 duration-300 dark:hover:text-gray-400 transition-colors duration-1000">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			</button>
			<h2 class="text-2xl font-semibold text-gray-800 dark:text-white text-center mb-4 transition-colors duration-1000">Manage API Keys</h2>

			<div class="space-y-4">
			<div>
			<label class="block text-gray-700 dark:text-gray-300">Mistral API Key</label>
			<div class="relative">
			<input id="mistralKeyMan" type="password" value="***************" class="w-full p-2 border rounded-md dark:bg-stone-600 dark:border-gray-400 dark:text-gray-100 transition-colors duration-1000">
			<button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400 transition-colors duration-1000" onclick="toggleVisibility('mistralKeyMan')">
			👁
			</button>
			</div>
			</div>

			<div>
			<label class="block text-gray-700 dark:text-gray-300">Hugging Face API Key</label>
			<div class="relative">
			<input id="huggingfaceKeyMan" type="password" value="***************" class="w-full p-2 border rounded-md dark:bg-zinc-600 dark:border-gray-400 dark:text-gray-100">
			<button type="button" class="absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-400" onclick="toggleVisibility('huggingfaceKeyMan')">
			👁
			</button>
			</div>
			</div>
			</div>

			<div class="flex justify-end mt-6 space-x-3">
			<button class="px-4 py-2 dark:text-white text-gray-900 bg-gray-300 dark:bg-gray-500 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 cursor-not-allowed pointer-events-none transition-colors duration-1000" onclick="resetKeys()">
			Reset
			</button>
			<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-1000" onclick="saveKeys('update')">
			Save Changes
			</button>
			</div>
			</div>
			</div>


			<!-- Warning Modal: No API Key Set -->
			<div id="warningModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 pointer-events-none transition-all duration-700 hidden">
			<div id="warningModalContent" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transform translate-y-full transition-all duration-300 animate-exit">

			<!-- Warning Title -->
			<h2 class="text-xl font-semibold text-center text-red-500 dark:text-red-400 flex items-center justify-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
			<path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .894.553l9 18A1 1 0 0 1 21 22H3a1 1 0 0 1-.894-1.447l9-18A1 1 0 0 1 12 2zm-1 8a1 1 0 0 0 2 0v4a1 1 0 0 0-2 0v-4zm1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 12 18z" clip-rule="evenodd"/>
			</svg>
			<span class="font-bold text-red-500">Warning:</span> <span class="text-orange-400 font-normal">API Key Not Set</span>
			</h2>

			<!-- Warning Message -->
			<p class="mt-4 text-center text-gray-800 dark:text-gray-200">
			It looks like you haven't set up your API keys. To proceed, please enter your keys.
			</p>

			<!-- Action Buttons -->
			<div class="mt-6 flex justify-between space-x-4">
			<button class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-1000"
			onclick="closeWarningModal(); showApiQueryModal();">
			Close
			</button>
			<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-1000"
			onclick="closeWarningModal(); showApiQueryModal();">
			Set API Keys
			</button>
			</div>
			</div>
			</div>


			<!-- ApiNotSetModal Modal: atleast one API must be set -->
			<div id="ApiNotSetModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-50 transition-colors duration-1000">
			<div id="ApiNotSetContent" class="relative bg-white dark:bg-gray-800 p-6 xl:p-8 rounded-lg shadow-lg flex flex-col items-center animate-exit md:min-w-md lg:min-w-lg xl:min-w-2xl transition-colors duration-1000">
			<!-- Close Button -->
			<button id="closeModalApiWarn" onclick="closeApiNotSetWarning(); showApiQueryModal();" class="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500 duration-300">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hover:rotate-45 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			</button>

			<!-- Warning Icon -->
			<div class="flex items-center justify-center w-16 h-16 bg-yellow-500 dark:bg-yellow-500 rounded-full shadow-md transition-colors duration-1000">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
			<path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .894.553l9 18A1 1 0 0 1 21 22H3a1 1 0 0 1-.894-1.447l9-18A1 1 0 0 1 12 2zm-1 8a1 1 0 0 0 2 0v4a1 1 0 0 0-2 0v-4zm1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 12 18z" clip-rule="evenodd"/>
			</svg>
			</div>

			<!-- Warning Message -->
			<p id="warningMSG" class="mt-4 text-gray-700 dark:text-gray-200 text-center font-medium transition-colors duration-1000">
			Please set at least one API key:
			</p>
			<div class="flex gap-2 mt-2">
			<span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md transition-colors duration-1000">HF--Huggingface</span>
			<span class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md transition-colors duration-1000">Mistral</span>
			</div>
			<p class="mt-2 text-gray-700 dark:text-gray-200 text-center">
			or <span class="font-semibold text-blue-500 dark:text-blue-400">both</span>.
			</p>

			</div>
			</div>


			<!-- API setting Success Modal -->
			<div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-500 hidden">
			<div id="successModalContent" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 transform scale-95 transition-all transform duration-1000">

			<!-- Success Icon & Title -->
			<h2 class="text-xl font-semibold text-center text-green-500 dark:text-green-400 flex items-center justify-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
			<path fill-rule="evenodd" d="M10 15.172l7.071-7.071a1 1 0 011.415 1.414l-8.486 8.485a1 1 0 01-1.414 0L4.929 13.9a1 1 0 011.415-1.414L10 15.172z" clip-rule="evenodd"/>
			</svg>
			Success!
			</h2>

			<!-- Success Message -->
			<p id="success-message" class="mt-4 text-center text-gray-800 dark:text-gray-200">
			Operation Successful
			</p>
			<p id="restartBt" class="hidden text-center text-black dark:text-gray-200">Need to <span class="text-green-400 font-semibold">Restart</span> the app for changes to take effect!</p>
			<!-- Action Buttons -->
			<div class="hidden mt-6 flex justify-between space-x-4">
			<button class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-1000 cursor-not-allowed"
			onclick="closeSuccessModal();">
			Close
			</button>
			<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-orange-400 hover:text-slate-900 transition-colors duration-1000"
			onclick="closeSuccessModal(); onSuccessAction();">
			Ok
			</button>
			</div>
			</div>
			</div>

			<!--DiagView Modal Wrapper -->
			<div id="diagViewModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all duration-1000 z-40 translate-x-full opacity-0">
			<section class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-[99vw] lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl w-full h-[90vh] overflow-hidden relative transition-all duration-1000">
			<button
			onclick="closediagViewModal();"
			class="absolute top-1 right-3 text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded z-30 transition-all duration-1000"
			>Close</button>
			<div class="w-full h-[96%] my-4 overflow-auto">
			<div id="modal-content" class="p-4 flex flex-col"></div>
			</div>
			</section>
			</div>

			<!-- Loading Modal -->
			<div id="loadingModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden z-41">
			<div id="modalMainBox" class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center animate-exit transition-all duration-1000">
			<!-- Spinner Animation -->
			<div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
			<p id="loadingMSG" class="mt-3 text-gray-700">Processing, please wait...</p>
			</div>
			</div>

			<!-- General Success Modal -->
			<div id="success-modal-GN" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 hidden z-41">
			<div id="successBoxBody-GN" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm text-center animate-exit transition-all duration-1000">
			<!-- Animated Checkmark -->
			<div class="flex items-center justify-center">
			<div class="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center animate-scale">
			<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 animate-draw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M5 13l4 4L19 7"></path>
			</svg>
			</div>
			</div>

			<!-- Success Message -->
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Success!</h2>
			<p id="SuccessMsg-GN" class="text-sm text-gray-600 dark:text-gray-300 mt-2">Your action was completed successfully.</p>

			<!-- Close Button -->
			<button id="CloseSucsessModal-GN" onclick="window.hideStatus('success')" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
			OK
			</button>
			</div>
			</div>

			<!-- Error Modal -->
			<div id="errorModal-GN" class="hidden fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-41">
			<div id="errorBox-GN" class="bg-white p-6 rounded-lg shadow-lg min-w-80 max-w-[90vw] md:max-w-[70vw] animate-exit transition-all duration-1000">
			<h2 class="text-lg font-semibold text-red-600">Error!</h2>
			<p id="error-message-GN" class="mt-2 text-gray-600" id="errorMessage">Something went wrong.</p></p>
			<section class="flex justify-center">
			<button onclick="window.hideStatus('error')" class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
			Close
			</button>
			</section>
			</div>
			</div>

			</main>
			</body>
			<script src="js/managers/packed_HF_Audio.js"></script>
			<script src="js/script.js"></script>
			<script src="js/Utils/packed_chatUtils.js"></script>
			<script src="js/managers/packed_HF_Chat.js"></script>
			<script src="js/router.js"></script>
			<script src="js/managers/packed_MistralChatsAdmin.js"></script>
			<script src="js/Utils/apiUtils.js"></script>
			</html>

\`\`\``
//Ai content emulator for Test
async function* generateTextChunks(message=null, hf = false) {
	message = message ? message : Custommessage
	const chunkSize = 1; // Number of characters per chunk
	message = message.split(' ');
	let index = 0;
	const totalLength = message.length;
	while (index < totalLength) {
		// Generate a chunk of text
		const chunk = message.slice(index, index + chunkSize);
		if (hf === true) {
			yield { choices: [{ delta: { content: `${chunk} ` } }] };
		} else {
			yield { data: { choices: [{ delta: { content: `${chunk} ` } }] } };

		}
		index += chunkSize;

		// Wait for 0.5 seconds before generating the next chunk
		await new Promise(resolve => setTimeout(resolve, 0));
	}
}
window.generateTextChunks = generateTextChunks;
