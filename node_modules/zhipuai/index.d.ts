interface RequestInit {
    signal: AbortSignal | null;
    agent?: any;
    headers?: Record<string, string>;
    body?: string | undefined;
    method: HTTPMethod;
}
type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type PromiseOrValue<T> = Promise<T> | T;
type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;
type Headers = Record<string, string | null | undefined>;
type Readable = unknown;
type Agent = unknown;
type DefaultQuery = Record<string, string | undefined>;

interface APIClientOptions {
    baseURL: string;
    maxRetries?: number;
    timeout?: number;
    httpAgent?: Agent;
    fetch?: Fetch;
}

declare class Stream<Item> implements AsyncIterable<Item> {
    private iterator;
    controller: AbortController;
    constructor(iterator: () => AsyncIterator<Item>, controller: AbortController);
    static fromSSEResponse<Item>(response: Response, controller: AbortController): Stream<Item>;
    [Symbol.asyncIterator](): AsyncIterator<Item>;
}

type RequestOptions<Req = unknown | Record<string, unknown> | Readable> = {
    method?: HTTPMethod;
    path?: string;
    query?: Req;
    body?: Req | null;
    headers?: Headers;
    stream?: boolean;
    maxRetries?: number;
    timeout?: number;
    httpAgent?: Agent;
    signal?: AbortSignal | null;
    idempotencyKey?: string;
    __streamClass?: typeof Stream;
};
type FinalRequestOptions<Req = unknown | Record<string, unknown> | Readable> = RequestOptions<Req> & {
    method: HTTPMethod;
    path: string;
};

type RequestClient = {
    fetch: Fetch;
};

type APIResponseProps = {
    response: Response;
    options: FinalRequestOptions;
    controller: AbortController;
};
declare class APIPromise<T> extends Promise<T> {
    private responsePromise;
    private parseResponse;
    private parsedPromise;
    constructor(responsePromise: Promise<APIResponseProps>, parseResponse?: (props: APIResponseProps) => PromiseOrValue<T>);
    asResponse(): Promise<Response>;
    withResponse(): Promise<{
        data: T;
        response: Response;
    }>;
    private parse;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
}

declare class ZhipuAIError extends Error {
}

declare class APIError extends ZhipuAIError {
    readonly status: number | undefined;
    readonly headers: Headers | undefined;
    readonly error: Object | undefined;
    readonly code: string | null | undefined;
    readonly param: string | null | undefined;
    readonly type: string | undefined;
    readonly request_id: string | null | undefined;
    constructor(status: number | undefined, error: Object | undefined, message: string | undefined, headers: Headers | undefined);
    private static makeMessage;
    static generate(status: number | undefined, errorResponse: Object | undefined, message: string | undefined, headers: Headers | undefined): APIError;
}

declare abstract class APIClient {
    protected baseURL: string;
    protected maxRetries: number;
    protected timeout: number;
    protected httpAgent: Agent;
    private fetch;
    protected idempotencyHeader?: string;
    constructor({ baseURL, maxRetries, timeout, httpAgent, fetch: overridenFetch, }: APIClientOptions);
    protected prepareOptions(options: FinalRequestOptions): Promise<void>;
    protected prepareRequest(request: RequestInit, { url, options }: {
        url: string;
        options: FinalRequestOptions;
    }): Promise<void>;
    protected getRequestClient(): RequestClient;
    protected authHeaders(options: FinalRequestOptions): Headers;
    protected defaultQuery(): DefaultQuery | undefined;
    protected defaultHeaders(options: FinalRequestOptions): {
        'X-Stainless-Lang': "js";
        'X-Stainless-Package-Version': string;
        'X-Stainless-OS': `Other:${string}` | "MacOS" | "Linux" | "Windows" | "FreeBSD" | "OpenBSD" | "iOS" | "Android" | "Unknown";
        'X-Stainless-Arch': `other:${string}` | "x32" | "x64" | "arm" | "arm64" | "unknown";
        'X-Stainless-Runtime': "node" | "unknown" | "edge" | "browser:ie" | "browser:edge" | "browser:chrome" | "browser:firefox" | "browser:safari" | "deno";
        'X-Stainless-Runtime-Version': string;
        Accept: string;
        'Content-Type': string;
        'User-Agent': string;
    };
    protected defaultIdempotencyKey(): string;
    protected validateHeaders(headers: Headers, customHeaders: Headers): void;
    private getUserAgent;
    private calculateContentLength;
    protected stringifyQuery(query: Record<string, unknown>): string;
    protected buildURL<Req>(path: string, query: Req | null | undefined): string;
    private buildHeaders;
    protected buildRequest(options: FinalRequestOptions): {
        url: string;
        req: RequestInit;
        timeout: number;
    };
    protected fetchWithTimeout(url: RequestInfo, reqInit: RequestInit | undefined, timeoutNumber: number, controller: AbortController): Promise<Response>;
    private calculateDefaultRetryTimeoutMillis;
    private retryRequest;
    private shouldRetry;
    protected makeStatusError(status: number | undefined, error: Object | undefined, message: string | undefined, headers: Headers | undefined): APIError;
    private makeRequest;
    protected request(options: FinalRequestOptions, remainingRetries?: number | null): APIPromise<unknown>;
    private methodRequest;
    get(path: string, options: RequestOptions): APIPromise<unknown>;
    post(path: string, options: RequestOptions): APIPromise<unknown>;
    patch(path: string, options: RequestOptions): APIPromise<unknown>;
    put(path: string, options: RequestOptions): APIPromise<unknown>;
    delete(path: string, options: RequestOptions): APIPromise<unknown>;
}

interface ZhipuAIClientOptions {
    apiKey?: string | undefined;
    organization?: string | null | undefined;
    project?: string | null | undefined;
    baseURL?: string | null | undefined;
    timeout?: number;
    httpAgent?: Agent;
    fetch?: Fetch | undefined;
    maxRetries?: number;
    defaultHeaders?: Headers;
    defaultQuery?: DefaultQuery;
    dangerouslyAllowBrowser?: boolean;
}

interface ChatCompletionMessageToolCallFunction {
    name: string;
    arguments: string;
}
type ChatCompletionMessageToolCall = {
    id: string;
} & ({
    type: 'function';
    function: ChatCompletionMessageToolCallFunction;
} | {
    type: 'web_search';
} | {
    type: 'retrieval';
});
interface ChatCompletionAssistantMessageParams {
    role: 'assistant';
    content?: string | null;
    tool_calls?: Array<ChatCompletionMessageToolCall>;
}

interface ChatCompletionSystemMessageParams {
    role: 'system';
    content: string;
}

interface ChatCompletionToolMessageParams {
    role: 'tool';
    content: string;
    tool_call_id: string;
}

interface ChatCompletionUserMessageParams {
    role: 'user';
    content: string;
}

type ChatCompletionMessageParams = ChatCompletionSystemMessageParams | ChatCompletionUserMessageParams | ChatCompletionAssistantMessageParams | ChatCompletionToolMessageParams;

type ChatCompletionToolChoiceOption = 'auto';

type JSONSchemaTypeName = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
type JSONSchemaType = string | number | boolean | JSONSchemaObject | JSONSchemaArray | null;
interface JSONSchemaObject {
    [key: string]: JSONSchemaType;
}
interface JSONSchemaArray extends Array<JSONSchemaType> {
}
type JSONSchemaDefinition = JSONSchema | boolean;
interface JSONSchema {
    $id?: string | undefined;
    $comment?: string | undefined;
    type?: JSONSchemaTypeName | JSONSchemaTypeName[] | undefined;
    enum?: JSONSchemaType[] | undefined;
    const?: JSONSchemaType | undefined;
    multipleOf?: number | undefined;
    maximum?: number | undefined;
    exclusiveMaximum?: number | undefined;
    minimum?: number | undefined;
    exclusiveMinimum?: number | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    pattern?: string | undefined;
    items?: JSONSchemaDefinition | JSONSchemaDefinition[] | undefined;
    additionalItems?: JSONSchemaDefinition | undefined;
    maxItems?: number | undefined;
    minItems?: number | undefined;
    uniqueItems?: boolean | undefined;
    contains?: JSONSchemaDefinition | undefined;
    maxProperties?: number | undefined;
    minProperties?: number | undefined;
    required?: string[] | undefined;
    properties?: {
        [key: string]: JSONSchemaDefinition;
    } | undefined;
    patternProperties?: {
        [key: string]: JSONSchemaDefinition;
    } | undefined;
    additionalProperties?: JSONSchemaDefinition | undefined;
    propertyNames?: JSONSchemaDefinition | undefined;
    if?: JSONSchemaDefinition | undefined;
    then?: JSONSchemaDefinition | undefined;
    else?: JSONSchemaDefinition | undefined;
    allOf?: JSONSchemaDefinition[] | undefined;
    anyOf?: JSONSchemaDefinition[] | undefined;
    oneOf?: JSONSchemaDefinition[] | undefined;
    not?: JSONSchemaDefinition | undefined;
    format?: string | undefined;
    title?: string | undefined;
    description?: string | undefined;
    default?: JSONSchemaType | undefined;
    readOnly?: boolean | undefined;
    writeOnly?: boolean | undefined;
    examples?: JSONSchemaType | undefined;
}

interface FunctionDefinition {
    name: string;
    description: string;
    parameters?: FunctionParameters;
}
type FunctionParameters = JSONSchema;
declare class APIResource {
    protected _client: ZhipuAI;
    constructor(client: ZhipuAI);
}

type ChatCompletionTool = {
    type: 'function';
    function: FunctionDefinition;
} | {
    type: 'web_search';
    web_search: {
        enable?: boolean;
        search_query?: string;
    };
} | {
    type: 'retrieval';
    retrieval: {
        knowledge_id: string;
        prompt_template?: string;
    };
};

type ChatModel = 'glm-4' | 'glm-3-turbo' | 'chatglm_turbo' | 'characterglm' | 'chatglm_pro' | 'chatglm_std' | 'chatglm_lite';

interface ChatCompletionCreateParamsBase {
    messages: Array<ChatCompletionMessageParams>;
    model: (string & {}) | ChatModel;
    max_tokens?: number | null;
    stop?: string | null | Array<string>;
    stream?: boolean | null;
    temperature?: number | null;
    tool_choice?: ChatCompletionToolChoiceOption;
    tools?: Array<ChatCompletionTool>;
    top_p?: number | null;
    request_id?: string;
    do_sample?: boolean;
    user_id?: string;
}
interface ChatCompletionCreateParamsNonStreaming extends ChatCompletionCreateParamsBase {
    stream?: false | null;
}
interface ChatCompletionCreateParamsStreaming extends ChatCompletionCreateParamsBase {
    stream: true;
}
type ChatCompletionCreateParams = ChatCompletionCreateParamsNonStreaming | ChatCompletionCreateParamsStreaming;

interface ChatCompletionMessage {
    role: 'assistant';
    content: string | null;
    tool_calls?: Array<ChatCompletionMessageToolCall>;
}

type ZhipuAIFinishReason = 'sensitive' | 'network_error';
interface ChatCompletionChoice {
    finish_reason: ('stop' | 'length' | 'tool_calls' | 'content_filter') & ZhipuAIFinishReason;
    index: number;
    message: ChatCompletionMessage;
}

interface ChatCompletionChunkChoiceDelta {
    content?: string | null;
    role?: 'assistant';
    tool_calls?: Array<ChatCompletionMessageToolCall>;
}
interface ChatCompletionChunkChoice {
    delta: ChatCompletionChunkChoiceDelta;
    finish_reason: ('stop' | 'length' | 'tool_calls' | 'content_filter') & ZhipuAIFinishReason;
    index: number;
}

interface ChatCompletionChunk {
    id: string;
    choices: Array<ChatCompletionChunkChoice>;
    created: number;
    model: string;
    object: 'chat.completion.chunk';
}

interface CompletionUsage {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
}

interface ChatCompletionResponse {
    id: string;
    choices: Array<ChatCompletionChoice>;
    created: number;
    model: string;
    object: 'chat.completion';
    usage?: CompletionUsage;
    request_id?: string;
}

type ChatCompletionTaskStatus = 'PROCESSING' | 'SUCCESS' | 'FAIL';

interface ChatCompletionTaskCreateResponse {
    id: string;
    model: string;
    request_id: string;
    task_status: ChatCompletionTaskStatus;
}

interface ChatCompletionTaskRetrieveParams {
    id: string;
}

type ChatCompletionTaskRetrieveResponse = {
    id: string;
    request_id?: string;
    task_status: 'PROCESSING';
} | {
    id: string;
    request_id?: string;
    task_status: 'SUCCESS';
    choices: Array<ChatCompletionChoice>;
    created: number;
    model: string;
    usage?: CompletionUsage;
} | {
    id: string;
    request_id?: string;
    task_status: 'FAIL';
};

declare class ChatCompletionTasks extends APIResource {
    create(body: ChatCompletionCreateParamsNonStreaming, options?: RequestOptions): APIPromise<ChatCompletionTaskCreateResponse>;
    retrieve(body: ChatCompletionTaskRetrieveParams, options?: RequestOptions): APIPromise<ChatCompletionTaskRetrieveResponse>;
}

declare class ChatCompletions extends APIResource {
    tasks: ChatCompletionTasks;
    create(body: ChatCompletionCreateParamsNonStreaming, options?: RequestOptions): APIPromise<ChatCompletionResponse>;
    create(body: ChatCompletionCreateParamsStreaming, options?: RequestOptions): APIPromise<Stream<ChatCompletionChunk>>;
}

declare class Chat extends APIResource {
    completions: ChatCompletions;
}

interface Embedding {
    embedding: Array<number>;
    index: number;
    object: 'embedding';
}
interface EmbeddingUsage {
    prompt_tokens: number;
    total_tokens: number;
}
interface CreateEmbeddingResponse {
    data: Array<Embedding>;
    model: string;
    object: 'list';
    usage: EmbeddingUsage;
}

type EmbeddingModel = 'embedding-2' | 'text_embedding';

interface EmbeddingCreateParams {
    input: string | Array<string> | Array<number> | Array<Array<number>>;
    model: (string & {}) | EmbeddingModel;
}

declare class Embeddings extends APIResource {
    create(body: EmbeddingCreateParams, options?: RequestOptions): APIPromise<CreateEmbeddingResponse>;
}

type ImageModel = 'cogview-3';

interface ImageGenerateParams {
    prompt: string;
    model?: (string & {}) | ImageModel;
    user_id?: string;
}

interface Image {
    url?: string;
}
interface ImagesResponse {
    created: number;
    data: Array<Image>;
}

declare class Images extends APIResource {
    generate(body: ImageGenerateParams, options?: RequestOptions): APIPromise<ImagesResponse>;
}

declare class ZhipuAI extends APIClient {
    protected apiKey: string;
    protected organization: string | null;
    protected project: string | null;
    private options;
    private authManager;
    constructor({ baseURL, apiKey, organization, project, ...opts }?: ZhipuAIClientOptions);
    chat: Chat;
    embeddings: Embeddings;
    images: Images;
    protected defaultQuery(): DefaultQuery | undefined;
    protected authHeaders(options: FinalRequestOptions): Headers;
}

export { Chat, type ChatCompletionAssistantMessageParams, type ChatCompletionChunk, type ChatCompletionCreateParams, type ChatCompletionCreateParamsBase, type ChatCompletionCreateParamsNonStreaming, type ChatCompletionCreateParamsStreaming, type ChatCompletionMessageParams, type ChatCompletionMessageToolCall, type ChatCompletionMessageToolCallFunction, type ChatCompletionResponse, type ChatCompletionSystemMessageParams, type ChatCompletionTaskCreateResponse, type ChatCompletionTaskRetrieveParams, type ChatCompletionTaskRetrieveResponse, type ChatCompletionTaskStatus, type ChatCompletionToolMessageParams, type ChatCompletionUserMessageParams, ChatCompletions, type ChatModel, ZhipuAI };
