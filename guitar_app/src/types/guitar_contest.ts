/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/guitar_contest.json`.
 */
export type GuitarContest = {
  "address": "2Hg6qeZGBsMPDDM1RY65Ucwk5JbLrF3D3P9qdYbEfmSU",
  "metadata": {
    "name": "guitarContest",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createSubmission",
      "docs": [
        "Instruction 1: Creates a new SubmissionAccount to host a video"
      ],
      "discriminator": [
        85,
        217,
        61,
        59,
        157,
        60,
        175,
        220
      ],
      "accounts": [
        {
          "name": "submission",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "youtubeId",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateSubmission",
      "discriminator": [
        177,
        143,
        162,
        63,
        208,
        227,
        103,
        173
      ],
      "accounts": [
        {
          "name": "submission",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newTitle",
          "type": "string"
        },
        {
          "name": "newYoutubeId",
          "type": "string"
        }
      ]
    },
    {
      "name": "vote",
      "docs": [
        "Instruction 2: Allows a user to vote for a submission.",
        "This instruction uses a PDA (VoteReceipt) to prevent double voting."
      ],
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "submission",
          "writable": true
        },
        {
          "name": "voteReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "submission"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "submissionAccount",
      "discriminator": [
        254,
        14,
        34,
        50,
        170,
        36,
        60,
        191
      ]
    },
    {
      "name": "voteReceipt",
      "discriminator": [
        104,
        20,
        204,
        252,
        45,
        84,
        37,
        195
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notContestant",
      "msg": "Only the original contestant can update this submission."
    }
  ],
  "types": [
    {
      "name": "submissionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contestant",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "youtubeId",
            "type": "string"
          },
          {
            "name": "voteCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteReceipt",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
