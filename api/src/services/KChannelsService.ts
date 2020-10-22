import axios from 'axios';

import {randomNum} from "./randomNumber";
import {
    AuthenticationSuccess,
    ChannelDefinition,
    ClientInfo,
    ErrorResponse,
    Transaction,
    TransactionValue
} from "../types/kchannel";

const DEFAULT_CHAIN_ID = process.env.DEFAULT_CHAIN_ID;

export const getKChannelBase = (chainId = DEFAULT_CHAIN_ID): string => `https://zone-manager.${KCHANNEL_CHAINS[chainId]}.kchannels.io`;

/////////////////
// Auth stuffs //
/////////////////

export const getAuthChallenge = async (account, chainId = DEFAULT_CHAIN_ID): Promise<any> => {
    console.log(`Getting KChannel authentication message for chainId [${chainId}] and user [${account}]`);
    return axios.get(
        `${getKChannelBase(chainId)}/authentication_api/?signing_identity=${account}&client_unpredictable_number=${randomNum()}`
    ).then((response) => response.data);
}

export const getAuthenticationTypedMessage = (message, chainId = DEFAULT_CHAIN_ID) => {
    return {
        primaryType: "AuthenticationChallenge",
        types: AuthenticationTypes,
        domain: domainData(chainId),
        message,
    };
}

export const completeAuthChallenge = (authChallenge, signature, chainId = DEFAULT_CHAIN_ID): Promise<AuthenticationSuccess> => {
    const authBaseUrl = `${getKChannelBase(chainId)}/authentication_api/`;
    return axios.post(authBaseUrl, {
        ...authChallenge,
        signature,
    }).then((response) => response.data);
}

/////////////////////////
// Channel definitions //
/////////////////////////

export const getClientInfo = async (authToken, chainId = DEFAULT_CHAIN_ID): Promise<ClientInfo> => {
    console.log(`Getting clietn info`);
    return axios.get(
        `${getKChannelBase(chainId)}/ui/client_api/`,
        {
            headers: {
                "Authorization": `Bearer ${authToken}`,
            }
        }
    ).then((response) => response.data);
}

export const createChannelDefinition = async (authToken, chainId = DEFAULT_CHAIN_ID): Promise<ChannelDefinition> => {
    console.log(`Getting KChannel channel definition with auth token [${authToken}] on chain [${chainId}]`);

    return axios.post(`${getKChannelBase(chainId)}/client/channel/`,
        {
            jsonrpc: "2.0",
            id: 1,
            method: "create_channel_definition",
            params: []
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            }
        }).then((response) => response.data.result);
}

export const updateAndCompleteChannelDefinition = async (authToken, create_channel_def, chainId = DEFAULT_CHAIN_ID): Promise<ChannelDefinition> => {
    console.log(`Getting KChannel update and complete channel definition with auth token [${authToken}] on chain [${chainId}]`);

    return axios.post(`${getKChannelBase(chainId)}/client/channel/`,
        {
            jsonrpc: "2.0",
            id: 1,
            method: "update_and_complete_channel_definition",
            params: [create_channel_def]
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            }
        }).then((response) => response.data.result);
}

export function getChannelDefinitionTypedMessage(message, chainId = DEFAULT_CHAIN_ID) {
    return {
        primaryType: "ChannelDefinition",
        types: ChannelDefinitionTypes,
        domain: domainData(chainId),
        message,
    };
}

///////////////////
// Sending funds //
///////////////////

export function createNewTransaction(
    authToken,
    zone_client_endpoint,
    sender,
    channel_uuid,
    channel_version,
    recipient,
    transactionValue: TransactionValue
): Promise<any> {
    const params = [
        sender,
        channel_uuid,
        channel_version,
        recipient,
        [
            transactionValue
        ],
        false, // force external tx
        null, // unsure of this ... ?
        false, // fees subtracted from amount being sent ... ?
        false, // sending to user, not deposit address
    ];

    const url = `${zone_client_endpoint}transaction/`;
    console.log(`create_new_transaction() to ${url}`, JSON.stringify(params));

    return axios.post(url,
        {
            jsonrpc: "2.0",
            id: 1,
            method: "create_new_transaction",
            params: params
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            }
        }).then((response) => response.data);
}

export function processTransaction(authToken, zone_client_endpoint, channel_uuid, channel_version, transaction) {
    const url = `${zone_client_endpoint}transaction/`;
    console.log(`processTransaction() to ${url}`, JSON.stringify(transaction));

    return axios.post(url,
        {
            jsonrpc: "2.0",
            id: 1,
            method: "process_transaction",
            params: [
                transaction,
                channel_uuid,
                channel_version,
            ]
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            }
        }).then((response) => response.data);
}

export function completeTransaction(authToken, zone_client_endpoint, channel_uuid, channel_version, transactionSummary) {
    const url = `${zone_client_endpoint}transaction/`;
    console.log(`completeTransaction() to ${url}`, JSON.stringify(transactionSummary));

    return axios.post(url,
        {
            jsonrpc: "2.0",
            id: 1,
            method: "complete_transaction",
            params: [
                transactionSummary,
                channel_uuid,
                channel_version,
            ]
        },
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            }
        }).then((response) => response.data);
}

export function getTransactionDefinitionTypedMessage(message, primaryType, chainId = DEFAULT_CHAIN_ID) {
    //ChannelAsset(address smart_contract,uint256 chain_id,uint256 value)
    const channelAsset = [
        {name: "smart_contract", type: "address"},
        {name: "chain_id", type: "uint256"},
        {name: "value", type: "uint256"}
    ];

    //ChannelState(uint256 nonce,ChannelAsset[] channel_asset_list)
    const channelState = [
        {name: "nonce", type: "uint256"},
        {name: "channel_asset_list", type: "ChannelAsset[]"}
    ];

    //ChannelDefinition(string channel_uuid,uint256 definition_version,string channel_rating_id,address zone_address,address owner_address,address deposit_address,address validator_address,address[] sender_address_list)
    const channelDefinition = [
        {name: "channel_uuid", type: "string"},
        {name: "definition_version", type: "uint256"},
        {name: "channel_rating_id", type: "string"},
        {name: "zone_address", type: "address"},
        {name: "owner_address", type: "address"},
        {name: "deposit_address", type: "address"},
        {name: "validator_address", type: "address"},
        {name: "sender_address_list", type: "address[]"},
        {name: "initial_state_hash", type: "bytes32"}
    ];

    //TransactionValue(address smart_contract,uint256 chain_id,int256 value,string kind)
    const transactionValue = [
        {name: "smart_contract", type: "address"},
        {name: "chain_id", type: "uint256"},
        {name: "value", type: "int256"},
        {name: "kind", type: "string"}
    ];

    //TransactionParty(uint256 nonce,bytes32 state_hash,uint256 timestamp,ChannelDefinition channel_definition,TransactionValue[] fee_list)
    const transactionParty = [
        {name: "nonce", type: "uint256"},
        {name: "state_hash", type: "bytes32"},
        {name: "timestamp", type: "uint256"},
        {name: "channel_definition", type: "ChannelDefinition"},
        {name: "fee_list", type: "TransactionValue[]"}
    ];

    //Transaction(string request_uuid,string reference_data,TransactionValue[] value_list,TransactionParty sender_party,TransactionParty recipient_party)
    const transaction = [
        {name: "request_uuid", type: "string"},
        {name: "reference_data", type: "string"},
        {name: "value_list", type: "TransactionValue[]"},
        {name: "sender_party", type: "TransactionParty"},
        {name: "recipient_party", type: "TransactionParty"}
    ];

    //TransactionSummary(string request_uuid,string channel_uuid,uint256 definition_version,address client_signer_address,address zone_signer_address,bytes32 final_state_hash,bytes32 external_tx_reference,address recipient_address,bytes32 peer_last_seen_state_hash,uint256 timestamp,TransactionValue[] value_list)
    const transactionSummary = [
        {name: "request_uuid", type: "string"},
        {name: "channel_uuid", type: "string"},
        {name: "definition_version", type: "uint256"},
        {name: "client_signer_address", type: "address"},
        {name: "zone_signer_address", type: "address"},
        {name: "final_state_hash", type: "bytes32"},
        {name: "external_tx_reference", type: "bytes32"},
        {name: "recipient_address", type: "address"},
        {name: "peer_last_seen_state_hash", type: "bytes32"},
        {name: "timestamp", type: "uint256"},
        {name: "value_list", type: "TransactionValue[]"}
    ];

    //ExternalTxReference(string value,uint256 chain_id)
    const externalTxReference = [
        {name: "value", type: "string"},
        {name: "chain_id", type: "uint256"}
    ]

    //TransactionMetadata(string request_uuid,string channel_uuid,uint256 definition_version,uint256 reversal_nonce,ExternalTxReference[] external_tx_reference_list)
    const transactionMetadata = [
        {name: "request_uuid", type: "string"},
        {name: "channel_uuid", type: "string"},
        {name: "definition_version", type: "uint256"},
        {name: "reversal_nonce", type: "uint256"},
        {name: "external_tx_reference_list", type: "ExternalTxReference[]"}
    ];

    return {
        types: {
            EIP712Domain: domainSeparatorType,
            ChannelAsset: channelAsset,
            ChannelState: channelState,
            ChannelDefinition: channelDefinition,
            TransactionValue: transactionValue,
            TransactionParty: transactionParty,
            Transaction: transaction,
            TransactionSummary: transactionSummary,
            TransactionMetadata: transactionMetadata,
            ExternalTxReference: externalTxReference,
        },
        domain: domainData(chainId),
        primaryType: primaryType,
        message: message,
    };
}

///////////
// Types //
///////////

export const KCHANNEL_CHAINS = {
    1: "mainnet",
    3: "ropsten",
    4: "rinkeby",
    100: "xdai",
};

export const CHAIN_RPC = {
    1: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    3: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
    4: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
    100: "https://rpc.xdaichain.com/",
};

export const domainSeparatorType = [
    {name: "name", type: "string"},
    {name: "version", type: "uint256"},
    {name: "chainId", type: "uint256"},
    {name: "verifyingContract", type: "address"},
    {name: "salt", type: "bytes32"},
];

const AuthenticationTypes = {
    EIP712Domain: domainSeparatorType,
    AuthenticationChallenge: [
        {name: "text", type: "string"},
        {name: "client_unpredictable_number", type: "uint256"},
        {name: "unpredictable_number", type: "uint256"},
        {name: "client_ip", type: "string"},
        {name: "issued_at", type: "uint256"},
        {name: "expires_at", type: "uint256"},
        {name: "signing_identity", type: "address"},
    ],
};

const ChannelDefinitionTypes = {
    EIP712Domain: domainSeparatorType,
    ChannelDefinition: [
        {name: "channel_uuid", type: "string"},
        {name: "definition_version", type: "uint256"},
        {name: "channel_rating_id", type: "string"},
        {name: "zone_address", type: "address"},
        {name: "owner_address", type: "address"},
        {name: "deposit_address", type: "address"},
        {name: "validator_address", type: "address"},
        {name: "sender_address_list", type: "address[]"},
        {name: "initial_state_hash", type: "bytes32"},
    ],
};

export const domainData = (chainId) => {
    if (!chainId) {
        throw new Error(`Missing domain name configuration`);
    }

    switch (parseInt(chainId)) {
        case 1:
            return {
                name: "kChannels MVP",
                version: 1,
                chainId: 1,
                verifyingContract: "0x1944517aA5c7D02731A7efAa1023d5C998996461",
                salt: "0x8a102c4640cfefb2eda4ee058d8783d669df911a16140681aeae27bfcb6c93a3",
            };
        case 3:
            return {
                name: "kChannels MVP",
                version: 1,
                chainId: 3,
                verifyingContract: "0x13e43355ea13806e705eb32874deabfb60b430f9",
                salt: "0x1bca34e48898ea2e1b8b4001e3218fa6bf964f94d126b3d257108a481d91f71b",
            };
        case 4:
            return {
                name: "kChannels MVP",
                version: 1,
                chainId: 4,
                verifyingContract: "0x6cd7e721D9D13707D3D447235A30DACFDe2e9fe5",
                salt: "0xc4534c0e806db2a735d514924d31aedf0a58131fa433a7e4cc6c99f1b0a5c27a",
            };
        case 100:
            return {
                name: "kChannels MVP",
                version: 1,
                chainId: 100,
                verifyingContract: "0xD62fB951A937e1f6afEEECf1a778c4A5ddeD791d",
                salt: "0x6354dbe3f1d532aee9d8b117e359d0fcdbd8ae31c2fd8e95630dd67036e5bfc6",
            };
        default:
            throw new Error(`Unknown domain name configuration [${chainId}]`);
    }
};
