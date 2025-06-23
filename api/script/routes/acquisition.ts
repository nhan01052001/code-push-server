// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as express from "express";
import * as semver from "semver";

import * as utils from "../utils/common";
import * as acquisitionUtils from "../utils/acquisition";
import * as errorUtils from "../utils/rest-error-handling";
import * as redis from "../redis-manager";
import * as restHeaders from "../utils/rest-headers";
import * as rolloutSelector from "../utils/rollout-selector";
import * as storageTypes from "../storage/storage";
import { UpdateCheckCacheResponse, UpdateCheckRequest, UpdateCheckResponse } from "../types/rest-definitions";
import * as validationUtils from "../utils/validation";

import * as q from "q";
import * as queryString from "querystring";
import * as URL from "url";
import Promise = q.Promise;

const METRICS_BREAKING_VERSION = "1.5.2-beta";
const NEW_KEY_MOVE = {
  // android 
    "TZdjwG3ZC-15BJgoTRviEXjGwgxVgu5wnQfo7": "kAq4fqI3ygaXTgpao_lpBtJ3CP0ANyIbHTW3-l",
    "y-WqoDtYTsdEGHCYm7dfR10bi2YxzXmsrE3Hg": "Ok2rIeBOpaA2Nv8fEPDq5c36dq54NyIbHTW3-l",
    "ChmZt-Q5PiVPw0HTBw074XktMToZM7AEC0NXI": "X8LYdiTHQvRpk5V-CZ2OA-4nYuFPNyIbHTW3-l",
    "OI_UszUHqe7ENZFNou6g6zVEqFUc3xPPftaDpe": "9DqgJ7zMNV-SBK8VBzFfH2nvtI03NyIbHTW3-l",
    "EwJjx1-wS4nWfIwtpAerubvLRQx-wCTmMEiEh": "A6XbnOfCYLSAi_FpnlAHUhcXM5vGNyIbHTW3-l",
    "MjCEywy2GZKd71N950GJvTCymK0gmjfp3b0Dl": "x9tiVrRp2ioMkAK9VttBWUvRZAXNNyIbHTW3-l",
    "QxW6KxMFudY5Gd9xyHFsee7deCuj6cvBNRR4_": "3zPVaLJ6XqvZiPBp2qOOKN6xVavmNyIbHTW3-l",
    "clTACecVnbGXH_1Bxy23cJ-i48TEt0vhyQbVf": "6uN6dXyEipkDB_6bAcw4xAGaCbenNyIbHTW3-l",
    "8ZfULdgQBDbog4gbbEp-YWSV9BdukIqB7txSO": "fbmkTryrI1nl_k-uR6ZrCiXpGPRpNyIbHTW3-l",
    "o7wyJuCpfv0asOTpBqjAJCGn5FhQAWsgJ1ahv": "5U7cn-d_yCRoFUr7aMnpmbRcAJIONyIbHTW3-l",
    "BvTFvucmsZmUOUIOYjA7u_yeXNRA3xRg5KR-g": "7-gRRuvkZ9cLeTm1PZwY98jdgPv3NyIbHTW3-l",
    "U8N4Klikg71t8BxJ8wkx6qi9K2nd2bXFwNzvV": "bZjXZOU-jaOB0yJgVdELNhmCJ2RPNyIbHTW3-l",
    "_Ntu0UZ5BXUowonUOcnvueY1OqQc0Pfal1c0M": "uO7104H280AwSWRzRTFfgn--coZeNyIbHTW3-l",
    "p6TT6Ms9DQ2zjAYc8pYBdGMZwHZ4SVK-Yjszd": "ZdYLYCiRiwzbd-GTzv-_6HYeLlv6NyIbHTW3-l",
    "9PBPzsOufFlVgSkRCwRJw17Ob58v55TIvd9_r": "w6I3kByNVcN_egfCDnNpgXUZRLkjNyIbHTW3-l",
    "QgiMOOQW7LE_IHQ2zVSUQCdXJGX0KPM0W7IJE": "x1GKErBcdWk_hU7nKv0HdkZeYX2wNyIbHTW3-l",
    "TWRll83lRja6CdeGPhN2CASNTfPhQ-rn3HC6l": "bKE91J_WY0uY7zK97gbexcJ4BrwaNyIbHTW3-l",
    "p-ruSoJGE1XWWfUB8m_PTou7JTBlorgZJbwwD": "f3FnSQtqFiQ5UkIzRPve7mj50-FONyIbHTW3-l",
    "D3kh9dEmXXQkIYPzcMLXjc4GTeJDEoN_IXYlb": "2_jM4JDgcB26doaF3wngVEZ7SU_ONyIbHTW3-l",
    "bdSVQMmPk--pjkmTuCQPet3FmEtqo41h4u950": "kB6KXeNVaooIx-W_ds8CY3I0_dunNyIbHTW3-l",
    "vZl6R9u7lYf5EuYsfSsXQG5MAQYH_VgGUu9nz": "aLowIp7rV-8XUYk-LGMf4BtT8qAjNyIbHTW3-l",
    "FmWUzDSKOaMvc4p8DQn1FsC1Jt_bt55dI8tlx": "pFmKV724vE3ABZTiB7ML8tfSOMPbNyIbHTW3-l",
    "TO9Ub2UHXfO_xR7aHJDDVz51M6Jl9RcFrkFcI": "5G90ydGcI1k6m6kYgccivM-lWF6vNyIbHTW3-l",
    "pAM3mEJeUhApK9UGYRBoRurM9bg6XmFfFCQxt": "vcxt2Mz6ZA02DC-eCOmMrxEwQoG-NyIbHTW3-l",
    "krICwLM-Ls5VfZ6gznbSxV_us0LO7oqCSD48H": "5NFklZsjBU-bFRQbM_I0T1-q-wkuNyIbHTW3-l",
    "KPUQP-A4-LOvGEmhMwgEfuswqTuCN24VkUQqO": "8wT_K1BZGe1EpfQTjloIFjeuHBuKNyIbHTW3-l",
    "r_Lc_RWRgh2PatYcF63yWrlOS8i8O-lXENYCt": "4RKlZiGRvLHm3hNG_iIkTKP3KtjpNyIbHTW3-l",
    "6SkJ_zfgVZTxfpAjRwfg4wCpV4Vrn1uFpTnPW": "15oWmDGqivOPe4DVOtweMf8ompzXNyIbHTW3-l",
    "8NSzwVUAfPHf4QfqOC5vg1LJPDIdr1RtZh4kM": "AhBb_ILPlCgs-_lmonP07joRF1-bNyIbHTW3-l",
    "LTfOqGJhyBh07gmNs07hsDl5v9jbrdt48zvHL": "hnlXT3vweiapeVYLt48kllRKgFo3NyIbHTW3-l",
    "XBGDoC8Fd_P2fLuBrLJEnJbxRyQVcfwzYLqNx": "_hmQ8oMGn08bsqRvU9lrqYVHPxxRNyIbHTW3-l",
    "aDnobAni796cT3m-NJHyjSEnZwCSmG2bq9Eed": "0TGSb45Lnq2aIV8fehEVYkI8ZuLiNyIbHTW3-l",
    "C3n08rb-7AGl6DyjSvguEWHhcS933fS86XIrM": "CFCzDbm3stZw2xIDAlC1Dc4IEFNMNyIbHTW3-l",
    "PPTyvgF8MA15cy89Q9PtfwNZGKZdB9eqEmS-k": "f2nEERqhJ2weqTyceAJMvjN_-EBONyIbHTW3-l",
    "nfXC4H2gQaCk1dFyhLM7YBlo6OM5Fh6itJFR5": "kTxVT00wK0ogDMfU-v5cBH86SHfsNyIbHTW3-l",
    "j_uv53d8t4pwDH4TtmMR-WrN9MO1qjKZ8lIZ5": "Bq6Aya_Gv4vbwlNQAwzZ9tms88UbNyIbHTW3-l",
    "Lgh5wJ-xTF27uPm3tG7FwGIieHj2hnbXbF_Ga": "GbINys1SleNV-hDCZMjdJQpvF2yFNyIbHTW3-l",
    "1rdTcm-Tii9loXKY4KHjLTzk4ttTKklGAITos": "e0M7y7H2nKOi3Co2TaeHnq1lsUwtNyIbHTW3-l",
    "H4kRmbjboG_of2fAgVauW5aZeKsFy_vvexlE6": "NUBnmcnwLXAlg4qYm6rCyOTqHKuTNyIbHTW3-l",
    "wXRK_l4hcGRZ7uSqSbScYu_lc1vk3HDpmnSof": "Ik1VsGnDgfHpIfWIru3gIwjrSa84NyIbHTW3-l",
    "xl84Dql2k0jUeIg1JiJ26Uo0xV8-WGscNF4_C": "45oUqzmrGYn4Sv9rppZsHmPTFxSfNyIbHTW3-l",
    "ZgrD0mBcv5dKTJmsnxNYW-gN8jgnC-1MX2j5C": "w6uXHrjJp8FxrqYa16eHySZ8K0mmNyIbHTW3-l",
    "Yp84GaE78KLynaL6psAeQzsZNAfmjT-KpPKJR": "b1e0HNTNtvQkI5IEevM1K0URxq7SNyIbHTW3-l",
    "klReDh4r3y8WQkmQmqEyW65UF9Bo1Z8ARP-56": "fAP_pWq0x0YQUYhazXZ1cV1irLYiNyIbHTW3-l",
    "9_5RWRlK21_zgYqMlhTRDhq5Ul_KuA9rbBBEi": "DngHb_R6C6BPRgXoWCO2pQu5nsa9NyIbHTW3-l",
    "JfokJNs-WE8GFmK5Y0ETviOh22jtuUsQq9Xmn": "evdMVVtONnuJzicqR0S9E-ATIpp6NyIbHTW3-l",
    "iFudJHaDquFin7s9O9BEqxVBdc404lSxokRof": "7AsdGxetHtAsdMw8KeQOmlMjF7QdNyIbHTW3-l",
    "aiosodbAzovPiv7xsQKFn7luoHG9QLlDkdv81": "_Zi_piHnch8KfF-zCkytAydn21FMNyIbHTW3-l",
    "4KgIROHnZp9f6mCrE6VFpBOtEminQNz1BLi8Y": "JgahFnBG-ub_mdXFrz1LtmxO_n8YNyIbHTW3-l",
    "BN77uWmiGnPFOv-_zUdS31ArzswXQ3cWA6eT-": "w4GPohuVVR8MDw9W3d2iUhYT9KLANyIbHTW3-l",
    "DAKHQDH7qxAGw0v-4QzdO5Q1Mz2ErgYjCNq9G": "1lDmEdIADeknVSrAS18HoIkOokToNyIbHTW3-l",
    "8RKreV-4oDaYKs21n18n8oLcKbtdcAhEYoEsp": "t0qiuyp3njDZGuB5QXmFL9KfeOxDNyIbHTW3-l",
    "TLDyFiPyJ2nlnS_zHIih_uNbAF_5fky1muCay": "D27XhFsFBhGS2VUZqQHBiO2Ca1QYNyIbHTW3-l",
    "GYTfg8VBd7Jr8Zh-Ve8rz6pgCXh-nFwyaMAQF": "IUuweTjjW2wBuO1atTSPArPiMZecNyIbHTW3-l",
    "q2UYAL7hS3zh-Av9MIPsP-99gDoDBxuIlzvhQ": "mLW6chSlosvQ4dJ4ydricxT6X6PwNyIbHTW3-l",
    "weeDfguUNpwy9Bq-gKWA4zyYlAXLc6Su47X38": "211m4oRgdf2kiQkYFRgCtS_0VwQHNyIbHTW3-l",
    "TWASDE3aw_ryrWm7SteIc-Ii2qwCescOe201k": "Ri2wbVtRfdwuxoO7-D8S5pQixMmLNyIbHTW3-l",
    "tW6_qMdhwRvonYULlixqaT4eToXASA_BTNj0F": "erqlKEYgkrDv__b04AoyVHFmjP93NyIbHTW3-l",
    "6o9qqIGWsvylu3GUZIN1gDzoqO-3lidtrJRfJ": "klzAMF1wu_ZBiYP95Qy4uTO6okw4NyIbHTW3-l",
    "kL8nx2Z3JObPLuO-0AinJdTGWl7vtd-a7qziq": "fx47S0hf6Dv-EzHOjIpIe47I0LnGNyIbHTW3-l",
    "H9kSngySoZrRI-wy67zHbJCf5vM52Rjcf6ce5": "hs8YYWaxq7EIrZVH1QYAYDrfliqANyIbHTW3-l",
    "jxRNOTdZjt6e94Bwh7gvjBNiGjlW3L1uNyxOO": "8sLf9YX9ICAYEzV2frEvFGPWWtPMNyIbHTW3-l",
    "hbPjPZKaUgEpcaCxQO0-6oyAwp3A72OqQezIK": "Z01quxO1oSE7xH7XtKyERaxQPB03NyIbHTW3-l",
    "a_y9c-jL7C-BQatRdqCGTUtqNmFRz9VKqDeb7": "uvQ9awSXLTuB3xt0nKeSwxdeIs1QNyIbHTW3-l",
    "KWXucbfqKViqnIURjUxDiTvWRGnMkQQj287Bs": "TNNrH8ROUANUlWFvUGdJpsAyxSAFNyIbHTW3-l",
    "wWxWa7UarHgk-koEkVeJ_KgA2DhBQlHUZMOvg": "rCPtL4JdyK-aWZXhHXjaeKaBFo4YNyIbHTW3-l",
    "1u4MvnLtsgb_h5cSxh-ysEabFKvCzP_LqIsNW": "Kk3tlhqKT_ayonkXg87C5V08Umh8NyIbHTW3-l",
    "wxi4oe5XtAWoOfZ6tGs_b2SvLEQcjIoO-GiB7": "Z0KSYeyhgWzCU5ZbQdTpwBPBtGVYNyIbHTW3-l",
    "ge_TsQXN-SZQTkJjiYybEkBcIZtdGKpZ4csGf": "2_XnRB8fJRibPc22SwRr2S0cj-p0NyIbHTW3-l",
    "0eADy1g7gDJT6XkNTOmUlH-60FRJs4lbp6XJB": "XTIjEiXRKDI7Diy7z2I4EgjM8ZwtNyIbHTW3-l",
    "DfnjuPSMR0iyB0mObEtK93u-w0Hxc_WwpQdUw": "NEbnizah-PiDpX4OovEHm2EUCFcSNyIbHTW3-l",
    "JEjVOlIUYLSu8lNQXXQBPAK_fWEwO85Aok6Vv": "BdHpwlDKB9hEoeYoiZm_JLwTJVKoNyIbHTW3-l",
    "9s7tCN40z13INB4SvmQWG3XkrtPxxAQkDwueP": "sxnt3JtKm_m6wwb82zRUAn9QkAwGNyIbHTW3-l",
    "jVu2qt1u26vjAjGzGlqy6ZbSE6UjT0OURWeua": "0Aae3ne_gaC_b1WMkOTBKHhlbbmPNyIbHTW3-l",
    "4lJaYyv2IBuA7f982a6wfgEP7avGe4Fl9xFQt": "4PeVG4u2NvdcYs65BHdEAUpmT1cHNyIbHTW3-l",
    "1B_Cb2WBS903VzQ5xCmQW4LuC9XnKE5Tj27Ad": "CoBj2dAioSrU8fijrHTKYR6ab1nsNyIbHTW3-l",
    "gwT328_U3LI-MVh6sy43MomH5vc7lGxN18bdA": "ZTybHfxQsy84-Yw2HF3AQyV-_mGZNyIbHTW3-l",
    "GFb3D-w6XEZ7wUh3Etg2ej71Wsc16OEtmOOps": "7rnJ1214NMEBgOzjGRr-g_aDrbYLNyIbHTW3-l",
    "c4uLMOfUyTd3ffwzi8D-Ywb6iQW8NB2BkKu4m": "mxFFaxoZEuy3fBtr5fgI01yJ2JbtNyIbHTW3-l",
    "TnM2XX-q9lfjk9xI04-_rHoHB90-eLoi3gEID": "4zrCDYNVLP5TiNq3udzHl-vxJSoUNyIbHTW3-l",
    "PMkXHsCA9DYlMzaTbbeNiCRU8YxdQ74-OcSY5": "Pc2xboQDwf-FYkpw-RLkWt6ztQzrNyIbHTW3-l",
    "vXoNsy4refZyUTt4OyxopJ_dCAvo_egFIqVhO": "fRANzPv3kth38xZA7z6iEgV7Nh6GNyIbHTW3-l",
    "Y2JSwSrdimDL_fGja2IYwXCq-FXu98Hb1rN2D": "fE3j7vdWb9Q3y6mtlWvDjPqxXGMmNyIbHTW3-l",
    "kZ7pAH-AVweuNHSUs8klThaA77zHopQXZoOajT": "j4Osw7IG-WD6pWDsOu9qqd_TQee9NyIbHTW3-l",
    "O3sT3RwVpzUdjj7Gjgho6Br3Xtf_obRjw84US": "fz2AF-VoCpkNthzXFZcshX4bw-fRNyIbHTW3-l",
    "BDtvMTSLvMSvzpm7NXIEM47qfpvPzAfv7iVln": "KgNk9Og9Yf6MPnvOBDMQOIV2EjbdNyIbHTW3-l",
    "wgZdYOd_LmsfHHOX3rNQhKbbZYhKOXapG1k_l": "Tnows-KJJ9UxskNF_ljNaFmOdBXJNyIbHTW3-l",
    "g7h0gL28C2qtCqxS3EkJ77WoAeZLm6qhnBZoA": "tBiXjHOdUIc8uH3IAApjG9KsaK_-NyIbHTW3-l",
    "qW2GnR01fiaNpPicqwXTvpyiVCjg7zqEZ9Kay": "Jf3hEdWKNETy4NqMB5GAnk2RJCSVNyIbHTW3-l",
    "A_L9gosTxnS88CM0_OCB3N9Xegor2n-uWPaDbr": "Ud1orK0EP8o6gcu4V8a979rkoAWrNyIbHTW3-l",
    "5M9JVgFDE9F5W2Awih6mpcpgOpswniJP0JSxD": "yGMbtJL9vZj_bSbQM3BZ71SiHzEfNyIbHTW3-l",
    "HucB7dsTrD65Qv6VQ6za7Z3SrSUqrCErHkRSU3": "_Dcea-HelfI3KO8yRJZoWFD0d6o6NyIbHTW3-l",
    "BGF0ulst6sPZvetDUCMWMo6E_o_Wc3-PdEokdX": "g0ZarpHfmUMzu2sJQ5MErFlQgpnSNyIbHTW3-l",
    "47jHupiW3BYvAgMBx3VcWQBrZ0tu3d7Hg5nwVe": "fVIIkUth5wEHgxmZXnZwif8ktdEvNyIbHTW3-l",
    "60DgeR7Y2mai8PY89Rkf-RkPq3Ew93A4H0q_Cx": "sntdl1-py6tQ-iL5h3SZuKStQj36NyIbHTW3-l",
    "ItUMvQcD7cxD5G9TSCaVQOf1U1tsv2lO1j0UJW": "Bpj7XqSaEa7Oub6hpGr0qD7isIDrNyIbHTW3-l",
    "hVTzavMBZRIGg1XWa71KDKh1gtvGkc2J7363JH": "hMwdjhK38R6JIPn3q9LrNRieYJIFNyIbHTW3-l",
    "A54E6RWHngCD6W3MN7JXVoGs5mZrDMK_aD7HVq": "PcmWLcfg243ijNhuLfwFBfEef-09NyIbHTW3-l",
    "eDQE9B7k5mzTa07MDPDDkrO48GaWlAAcrZsA0b": "kJNzzMHL6KNqX57fz0EI-d1hQLolNyIbHTW3-l",
    "e5rxUvWAQ1x_RkGXa4wVahQOCzzeyzYWQrdMxY": "oG13tQK1K-ixTPKXx71GbAn5swgtNyIbHTW3-l",
    "SzF7y2hHZG5mWB653FW68XQuLWWGSQrEkKJ-sS": "aAZ2AgAtWLyzajjVXb8HhxUIK_gINyIbHTW3-l",
    "6x_T8ZBQRFXApZ6wqi4zisec5kEw--Zwvj6-jY": "Do5BOV23PvxVuE9US2wIe8CpVgUQNyIbHTW3-l",
    "UP6i9B_JY8fV6y5HhhXWqn2FywFl85-HNa7LhL": "h4t1hiby7FrlGx7o3LCBf_49clT1NyIbHTW3-l",
    "K0meJBDpc3oUBM_mR7i02vbzU_uQf-7SeZows1": "JQY9fD8Xd68YbmgfvWC_DiwaWiMgNyIbHTW3-l",
    "QFLhRcO4rpnPY_aofd0ehSjaWgNjiFgkKy1EQy": "_9u6Sx1fOJweJML6rNyKY3Dta5aPNyIbHTW3-l",
    "5kkdFmPj4F-_ok-EwTMrrtNFaLcR3Z4T77TSHG": "4kq4ukjRu0gWerifGi-kXApQU_TdNyIbHTW3-l",
    "84h1f0vcIKG2pPrjIfFzVqCJT83FLhBFZRsm4U": "qTOORC-YiVcHy4D1etWjUXytzO1wNyIbHTW3-l",
    "rHSnIoQoATnURjv2AXw6h8GABEeoyf9w0zIR13": "r5R2z892tZHoEwgIlI3RF6is6XmpNyIbHTW3-l",
    "0Umduq93QPQh3W_D6cNm36CNJuI082PD-0uTwB": "EEDOI-PHTxkVHOgpVFbai_aTfyb4NyIbHTW3-l",
    "QUMCZUS7UL4tcdkcbTWngaEVF21dZcIDFf2L-g": "pMGDwC5HN8GCSNAypfRmlzwlk2ZlNyIbHTW3-l",

  // key IOS
    "4767k2avO7MYu3VUmoHlZLB7IF9HCoiOhtL_Y": "mEym9DRO51rfK_682EaEoLTIwBWVNyIbHTW3-l",
    "VAQRIj1vHCqMzSVBPjyUrOXcGzSPwlLb0bSl8": "5zQLvy89M6UoeD7ZX09jbLe3eCG4NyIbHTW3-l",
    "gRh_rBD0vFrfowScjjaSd9TT2Ax5rMHsw-89H": "qrB6oIvprCPF2GGMHEJKwjt744xWNyIbHTW3-l",
    "GaSdEWrapeyzNfWxvf4SDVg3qgbM85I_n--xci": "gZf98PTxkvUCzZfb6N5H6KkoG5LdNyIbHTW3-l",
    "ivt6C2Rie5HAXk23pB-_mshdxHcUSeX3BsQe_": "p28620xQD6gEfux5Fni5RCKyPzweNyIbHTW3-l",
    "sk-3IGEUBZeYiOwgn9hwkKvUGXqt5jtLRNIoc": "I3WZcSN0mE_cCX4zsZ0R_cPDUe4SNyIbHTW3-l",
    "4YA5CtOMBNNSQ7lDmy5gltQRrr-JQ4n1Hdejp": "_9c8X2SW69wBpj3kpaU27xXE-NVENyIbHTW3-l",
    "B_2A2mfqtbB32DS0FotamzoQcGBQMtnVbaq0B": "8LIAP27NJyz8etlGEJ392EA-3yM6NyIbHTW3-l",
    "cRmeLRiPVobIJQCiCwqSuXVfGvWafqAmLTpEZ": "W-Ph3nzTaicXrCe_4i3UZwHpOLXNNyIbHTW3-l",
    "E_t2S1AEqHrnaz9jsnTVW8gHSKzVmdHtBNYoU": "7C-DIIhYTnxPHHZ1PfXS-gU1W8KfNyIbHTW3-l",
    "Oz2HKgM4EXrTLBWtQfN4EN4oF7kE1nqPXKliJ": "RePpuokvqGlwbqaGapBS2qPNUDLJNyIbHTW3-l",
    "1CQCDh-LvQygp7FRRW8JZB77d1kixPMRzihdb": "7Y-txadlgHTA1FUuOa4M_Idqv5dmNyIbHTW3-l",
    "atFeK5fVZe8i7pYia2XPQwAXX9aNf7UVeNroH": "tm2Df2UcF644NhO6e_EG2JBXWD8lNyIbHTW3-l",
    "rIT0dQ4s-D0z9eFUyxUuJLpKuRMUunVZurss6": "K5w4qEfnKXXziYvDroYsF5z7NOdNNyIbHTW3-l",
    "B53koiC1bhdCqh-n7me1eKgXjBiSV-9LkFBsz": "MrNR9CtzjwMbHKb8uSsrB6RbhvbaNyIbHTW3-l",
    "icYCTRlhTCeu0BuTCuSkHkcenbN_tg8Y6wzEZ": "PmyHdAVFPGQCWBFOLgLqfVkEiTDnNyIbHTW3-l",
    "0BabechDrcc5W0RDKLYxb4Z935e-ESes3hhdK": "YSFNslE57z0QqlN86aRguNY-shOgNyIbHTW3-l",
    "9y_59IEu7y3dxW4hiJQPf6RJlY15WPnOTDMFZ": "8jBtHRFGPZltDIVHZcXheDArqQepNyIbHTW3-l",
    "pP_nPTXiECorN2EpfrnMzL-Pongs1DT4k9IIu": "TLhdT3HaDKb-TBSX9YHenpgsJT-ZNyIbHTW3-l",
    "1CnFgWLnIUVA8JVa3mqLhqwcwUFp_lTYrmQg-": "skM_uISX3X2LmaNQnEzN_XoeCgdTNyIbHTW3-l",
    "0qMyYlrQlRETJwacRjfc4qGUNkpZXrN5rK4mu": "T2c8S7ef0Js8XleXwYKXCiQYO92ANyIbHTW3-l",
    "afQKeokfNFzY4AOaStMqb45yX8LbnXFe4om4r": "FShc_z8g6tldbMfuenmtopQy8OwJNyIbHTW3-l",
    "760u3x3fnfKsaTeDM1HbAjhUovJSfp49KVD8o": "mcW13w3c0LFAlkNF1ZNHW5thbb1qNyIbHTW3-l",
    "7jNmiK3r3au3m7IjCRl5WIZJkoYTiPiUnxo0_": "NNtxXEEspK7fAskyLUuVNi_3kh-kNyIbHTW3-l",
    "jbW1CDCIopYS7I1FdVghzcq9lvQ2QFtiMFjYr": "z4u0Tj3OjKUu11xNK5Q1o0kLpcifNyIbHTW3-l",
    "fFE40lB7UNtp-16UfdAUZ-ViPymXEM7JsZ98A": "pOrlV4uM266Hbkq_7YHulFlUWEx3NyIbHTW3-l",
    "ERmrW8lZ_ThC0TXkQjzmdl1oMuwzQ42ZZkPhf": "sc1H43OvNi99xeofnNpyjlKnuUQNNyIbHTW3-l",
    "o4QcDmxk9tIRTf1fKBw8tBG41Xmsc-_Q_FDtN": "sXaaa0DEwtpmaPNET4h_Ovq1QFuFNyIbHTW3-l",
    "isYrXG_VJA_DjmQpYQFCNXWnZdoY7RQLKaza3": "ZWgXtcHgw41Yf89bugb4ERfCRG08NyIbHTW3-l",
    "hED6YCqUvnEo3UZUKTahbOvEXJel3a_TJB0Uz": "uIf7ehyBVZYWlyE59tW1dLhCiJdbNyIbHTW3-l",
    "Q8ECAlX4_XyUTXzt5J5bcbWu7WmaMWI_tBDzX": "rMQAJ48rVqw9_Y-fARSToO2yKpgDNyIbHTW3-l",
    "PFzgebgx4U4UhlpAL390V06PvdaP4IpRD9iXh": "o3-Batx6N3XHaExq45tj_HjmbUmINyIbHTW3-l",
    "1hXVg-rIdQivFuTRgY1OFRAmbgG3Y-kDcrxXp": "0tFxKKhb5Zm-AdK3JKYMRhm7EzvINyIbHTW3-l",
    "kH-OduEr1bodInxfqfEKpGH7vmRcIQHDnwAiv": "_0fShU6KDpB9L8pNukuvjlQZ657UNyIbHTW3-l",
    "tIazM4lOMlpwv5ws_yUpApsnrWeCLFM7My_8f": "s-5K5oV9A13E2L1H2XoPhMijfDYWNyIbHTW3-l",
    "m06wg9Ev14q27ZOibS0hkKZCqME_t8igmMRSe": "UXUb4lYAHdUYd2uQRmYvp3Zf8HZrNyIbHTW3-l",
    "ucZwWkKpFlD1EPhxgQqEr_rbDIf99UDMhAboi": "a4MMUy0KyyugJOEy336JWKwMK7qDNyIbHTW3-l",
    "j3resHlfvN6-aamVVcSbwOwmYqKw9TwbmKNnF": "mD1Y9CDuU3jZkQ3iUG8rQ4wLKwBwNyIbHTW3-l",
    "tYJeJzwrIqv1vuFj5tapqQhoPS_MrcI3U7g-i": "6L1m7HmtzFsu9w3RQ5N-YV0MbCEuNyIbHTW3-l",
    "JBfmtbe_29kywEYdo9aDh4N899EOnn7OC8fW2": "b729v1S2l-dkyP3la5ArZRZ5XVggNyIbHTW3-l",
    "hD73onAmgF0ky_BasxXuKVUsmNrUhr9qmlrCy": "gna_RdbmuZa0Zhw5UmPpYvkJDntrNyIbHTW3-l",
    "ZolWrmtZTwy6D15HGQRdl8xfRqu9a_emE0FxD": "bzDSYkIOnTSQedpKrioYqq0_iwQ7NyIbHTW3-l",
    "gp76tnJVPkdsN4kTErayezU02Pb5gjI_TuW6l": "Kw7T6fcOiBdCBY5dx7a8G33hEWeCNyIbHTW3-l",
    "xtc57vuFsVDvxlgUp40_4WjjhOkl-A0B8erFk": "rOFwi9_MVRwit-OB7e75RUlLz6gGNyIbHTW3-l",
    "XyfXVlgjN45fDP2lxptjbCo8dzvyQpQEOgbJ1": "OqifB9t5em7E2HUzVJtF3ZlYs27mNyIbHTW3-l",
    "K36fwEBqIWXLDdGH09k8gdqzGH-YwuJsAXpSr": "lKNrTnj5IzusKaXboQUqb1zvRtI4NyIbHTW3-l",
    "fL4yzPYTS2IAlMuw9MXBpHV2Lx-4JaeD3do6s": "6sgs0QXdBKrTf8_OyZdW6K288aN9NyIbHTW3-l",
    "MrH-lk8xCVILfAaa9Z8WdmpRUv1qyt83555w1": "8cciGs2IkYp8sf0aFi6ugPWeob3iNyIbHTW3-l",
    "Sgo8gWKOp9_Qt_AMn3ImsvS4eXuAnzVyp5b1_": "NN0lMNd5chcTWtwhEQaxHfC_hRCiNyIbHTW3-l",
    "VOPJUz_PbawqAaySX01cpL8CKnUc7SEwWDfgU": "LxiHHrYiX12lHAp7o-YyLBxGh9YbNyIbHTW3-l",
    "JgslHKoqukmQJmnzJHOAztLa4dt3pa-8mOqdW": "nFYZqxLgthWH-IEX_AsK-v9_lTMTNyIbHTW3-l",
    "ZeZJn72cFtbmMKEVK-62yVtLKMI7hRiKrEEV0": "PisVNlwEx97xlXUHfjA0PdNyJatSNyIbHTW3-l",
    "HbP23XDBC4J03gch-l9s8n18Kxv5L_eU5wMAU": "GYIhaUK36IgCsjfV4_2Rj7pgd9OxNyIbHTW3-l",
    "pSeGGcd-HT7-cLlttNlxEUhbe_qcXmpJLQM3i": "XjsZmj5y3SEkJsdH6tHhZp4GFosPNyIbHTW3-l",
    "eZCergESyycV2QKnOQl_I_J8bta7WYPiB8wWi": "mEUiWSNZScaLaHTjp7XJdVWNUfd-NyIbHTW3-l",
    "26PGFzPbfrbPAlr7vVvdE1Uf4dYtYwDKTUmF0": "sGSfFBDVE5BYY6QA314Q1QqV_e7xNyIbHTW3-l",
    "2AC_YSN8c84iWnm9HxcbA14cv9rX-M2Ajs0Gq": "b7_aIYy4jgfoDkGBonnmLbS7jxG4NyIbHTW3-l",
    "nGFRd5ONhK0BYsC_lf1ZxyrVLnzG3MJbKTixN": "JvSt4BrNPtOGoOOl6c5M6oR7dWEVNyIbHTW3-l",
    "bwHY7sSVB-8rCXdT7JjvrR-9yXjTiCVdz0H35": "MgmnZZC9azTvDHZEOMMS2-YAlqd4NyIbHTW3-l",
    "JSZxgMhdFgHWIrgE5S9EgnwedZDhnVrsBz8gw": "h5WDPXRc-vqebmX99L9SyqRATxHkNyIbHTW3-l",
    "8oR9zxeQPcOm0inztc_SB1NYq5BOWbGBLFO4l": "VqIC6qgumAj1CBImY9y-Wp9BAwBPNyIbHTW3-l",
    "V3aRXRvn1HSaArijdi7zP41G8eFaqJL75e4H2": "RnIpCCd-xpmQ3dDxDy2QvYf05K_JNyIbHTW3-l",
    "JMQVqdOEkowd_kdQyH5Gk2TraAJh3xtV4ASTm": "aCgvY6ak6xbKShMkOO4IHHyqFCAHNyIbHTW3-l",
    "qmWeQLkH0JMpay-PfpBV5Cv1AdD7nIFqKX9aM": "ro8bRVe4QkMu-gYMpz_4ufJ4DLHaNyIbHTW3-l",
    "O5foPSpvWPSV7guRfazng5rwUbjXVCq9bQsPZ": "NqCDmk_3iDkvKFOIJZ8oXftVzKdKNyIbHTW3-l",
    "g2qExb4xOodSJ3pNtx4lNXoLY-ifq1J-p76kf": "yJHcq4mTQjy-bLyPhKxlgXfOXNlhNyIbHTW3-l",
    "rCnkiqVuY2Do6j9wiwb7TBTyDIsZGyXeuq0Gk": "egIlp04EgUueoksQkRVghpNyfRS4NyIbHTW3-l",
    "BxoHcP9Tq0ByNaCci15iUlsZ14cIqkAkIEqoy": "TKwKtSCnJZeMnYFbkRIQeJ0xT53rNyIbHTW3-l",
    "OLk4xhss5XU4VHYIriKBxXKjyYP7Nh-0Z0M5Q": "T4PhHoXYwD5OpAX8AW5nwAW3yo6VNyIbHTW3-l",
    "RXavGY_pRBmliKFpsg0E6pcz1FoLry-ioQ9xn": "96ihiVbmNp62J70BERUOmlZZ2-81NyIbHTW3-l",
    "JQkSOqGmAdjClCGj1PsDxSCyTEjvvQwfJI6rG": "YBHgYz6ZEBDXCbH2s6l9SYBdBtH3NyIbHTW3-l",
    "Vgfg24YgvRuWcHcxfTXDs19lN9hT-q2v6TLbh": "0cLMCbqq08Xpg3VB2hrSJy2Vvz9KNyIbHTW3-l",
    "zoUN4L5DZnKIOhSmsW7wEUbiT_UojGJos_TSy": "h2IEedr7ilsi0o2IICN_Qkukm57pNyIbHTW3-l",
    "YbOqI1IjkHTpjlhO1Vvn7b3Tf1bSpO1IGK00g": "5rD_zXKdN6QzSWVvf72_p0wWB6pBNyIbHTW3-l",
    "MSkp7qDWVSuOkNdDLjVr12nBOIGr8I5wpu_F8": "WogZfwAyr9wnfSexRdc_mThhdpg9NyIbHTW3-l",
    "Y7DFbfwiMWSOAtIQHvPWxqfJ4t-gzKXUiXFHu": "C2zDDS-zVVpgeRhYarMq7IZJvrG2NyIbHTW3-l",
    "_aZ60D-n_B5cLEqwF-TRC-pjUC7RlRVsUqJv7": "eFzTlbwShcVvA94lrGjKNryYWdW9NyIbHTW3-l",
    "17NVRC3Ac6pERiwzGsx8OBmh8KgAr8IZmUHNs": "yQTrQlLdSUoD5wNtAy24RnzizXmvNyIbHTW3-l",
    "l7H8fN3gkXf0NbQfFhFPRZkZQHCM_BKCuyny-": "eZmlKRXQKlXniBEAZM_MzJHMBsz_NyIbHTW3-l",
    "_iXQM3L3yroE6Y4-tfV2kNKstTYP84BgifSAA": "0G8euMJOZPAyVft2VIvGxjK18hjoNyIbHTW3-l",
    "vbSHVmkkugTW4LdpjnlwJUwAN-XeForyl-gQn": "6bA9Reo3Kc3f0epGD7bn9sHK3NauNyIbHTW3-l",
    "4713DqYetz5cJl8T64jZo81k--qn7fDN65c1Q": "gbV0x9ptIBlnjmCIbWwAZ8hHB9bTNyIbHTW3-l",
    "HWLg3RNw2Bbb0My2wtp8WAbjfr1X4ltlbMNg_": "fd51g-uHd2FJmDJSJQV--f9CkW6bNyIbHTW3-l",
    "8Y0yKFCSeOPb_-fj0F8H8jC-BayFNkRZ6u8y8x": "HA1wIW13e8WjM58HhLyr21HL7YJzNyIbHTW3-l",
    "okyGlt-Dg1y_i86iWaQXt5DKoKxCC2yOPjo_o": "XxfldSQ6p2sd2e4dV_eXEEVbDRA2NyIbHTW3-l",
    "bwTp21CmG4yJWKNqZ9yRl2PH3znjiUoyoYep9": "N4AJR_O6dhccptdzvFRDrRSwX2SANyIbHTW3-l",
    "GhKyCPc-FPeHd8nspzr1IK85wRH6MEpMxPtA8": "yFOE0B7PWaH7Yr1E-lJLOypJtORgNyIbHTW3-l",
    "bopaR2FYzAwUatYb1n2Y8DBiRotjWaGIJbGKZ": "6xHpjuEusPYCtmEqtUFDeTbVz36nNyIbHTW3-l",
    "IOfmTvQ8Dv0vslPMvHJjnqqcPUrWiKJ6mmqmG": "cESXrjGSW1FpUD9LpXaNUfScskbxNyIbHTW3-l",
    "Uba9M9U_p_XI_B1KLnsQycRBXQWykPLBuRZIzm": "_Pf1w6ZP-s0EDhyIAkHWTjXx1ZGbNyIbHTW3-l",
    "x0riSNnV3WzDN0hSEZomgiOkq5sOq-HEsCZRt": "Z-WsgZ4jgUDSm_TkAwqR1nOWKrndNyIbHTW3-l",
    "zzU0Q7yFYxESAL_pr9QmHY-phO46peOTF2M7Fk": "Soi-syu5m76yB7-91KQcjnca73VyNyIbHTW3-l",
    "T93c6HlInR_3UgtptgL3r6nOMeTJXyqftqgZBw": "J-1HNo8NO5K3_gu2WMv4Isy7FSpvNyIbHTW3-l",
    "LCmHf8cABDn8YGhI4whCYnVkBohJ5u0n9ctcmK": "hemVG4O_CmCOiYv8uioZiNlowSbxNyIbHTW3-l",
    "RHZ5hTwrIawrtsgPWsfUJ4DWIY83UY_jtSUdop": "P-8gQZ_YTV2wai3P9mqZ759A8ramNyIbHTW3-l",
    "0-gsY9nyCa-rp9uxTcE_43tiHJeHeMXJZBqqCt": "q6cls5VFsjPGN22SXTsbcxXNkwE_NyIbHTW3-l",
    "TVvLYh8X5G4sIFtec5CftiKCjg56D6CykhCzg6": "M5PJK7zvXs6t0uOGuYSkskV1sT_wNyIbHTW3-l",
    "HF88wBnXaYAEF0RW1fK1RjhR6brkGCka2LhJrx": "_IQT0Evco6GhXeTn8hkGt2CNiYNMNyIbHTW3-l",
    "Lxsn4dnmw0gLEv5LfH2fFe_yUjJ51I2XBYVayN": "RNNNNU5f-J5aXoTrxNSF88IC2pCPNyIbHTW3-l",
    "cvwmMp4QyAYimKa7w-wJ6aN5cjwSh59ygGwu2c": "8DrDdmyNopvTUI48agvPYhfNcKQnNyIbHTW3-l",
    "X9hCJ8HDdkjrT09hnBsY99kD_ehgkjyiJzGy1X": "V_Uyy_5C-UEtsBe2aD29K4AamwTJNyIbHTW3-l",
    "67SGh7dYGM9hNDZhWM3MIDjtPBc3T7CYeY8d14": "gh3nEw8Nt5j8wK_VU5E1iuT-neyWNyIbHTW3-l",
    "7AG88ldPZi-Up5_yUEp4UTnhiff9CUdwGI6mAX": "wOo-aq2fYvoXOBq4UHoPawokzthXNyIbHTW3-l",
    "4_KjmxnBpkecE72lR3Z3Z204a4C1zLMFdqhbUM": "vUMONRHlP9e541xbe_QHRD_Lw3IBNyIbHTW3-l",
    "ZmbUEcGvWqe_dnlv_eOuNZLDZdWo-RhLIExxTy": "fN4X2DWitd0lLyxoLmqPys3ssctMNyIbHTW3-l",
    "bGkA6ycuiqrPFxKQsVOkEyiBBeCgeocGidywaH": "qfCgGVZzwDSzIAeLRW-kVMNUe1zqNyIbHTW3-l",
    "zWyvgnGnZanpD-uO2jv2TFoRujbAWSbimzb4ZX": "_RXzqEcJCaBV5q-IPsZYGzS9-hQ-NyIbHTW3-l",
    "chypuBfzLhr_Aa0_1_O_A83-FZycTlnb4tKTPh": "TyhjZt-1uABGpA1hvFUNmcWsJJvoNyIbHTW3-l",
    "aG_hF5tRHeE4d9yTQ4JA8WkyHdCIYhz_s4zolC": "KBJWBaAsOFloViQGj56Fun8PD6Y2NyIbHTW3-l",
    "uzlLhzQjrBa5lGdSbL9HxWexEQ2Tz2wkmr1Quw": "B4DNrXvF9al1pF33zh28kHu9KDu0NyIbHTW3-l"
};

export interface AcquisitionConfig {
  storage: storageTypes.Storage;
  redisManager: redis.RedisManager;
}

function getUrlKey(originalUrl: string): string {
  const obj: any = URL.parse(originalUrl, /*parseQueryString*/ true);
  delete obj.query.clientUniqueId;
  return obj.pathname + "?" + queryString.stringify(obj.query);
}

function handleDeploymentKey(deploymentKey: string) : string {
  let newDeploymentKey : string = deploymentKey;
  if(deploymentKey && NEW_KEY_MOVE[deploymentKey] != null)
    newDeploymentKey = NEW_KEY_MOVE[deploymentKey];
  
  return newDeploymentKey;
}

function createResponseUsingStorage(
  req: express.Request,
  res: express.Response,
  storage: storageTypes.Storage
): Promise<redis.CacheableResponse> {
  const deploymentKey: string = String(req.query.deploymentKey || req.query.deployment_key);
  const appVersion: string = String(req.query.appVersion || req.query.app_version);
  const packageHash: string = String(req.query.packageHash || req.query.package_hash);
  const isCompanion: string = String(req.query.isCompanion || req.query.is_companion);

  const updateRequest: UpdateCheckRequest = {
    deploymentKey: handleDeploymentKey(deploymentKey),
    appVersion: appVersion,
    packageHash: packageHash,
    isCompanion: isCompanion && isCompanion.toLowerCase() === "true",
    label: String(req.query.label),
  };

  let originalAppVersion: string;

  // Make an exception to allow plain integer numbers e.g. "1", "2" etc.
  const isPlainIntegerNumber: boolean = /^\d+$/.test(updateRequest.appVersion);
  if (isPlainIntegerNumber) {
    originalAppVersion = updateRequest.appVersion;
    updateRequest.appVersion = originalAppVersion + ".0.0";
  }

  // Make an exception to allow missing patch versions e.g. "2.0" or "2.0-prerelease"
  const isMissingPatchVersion: boolean = /^\d+\.\d+([\+\-].*)?$/.test(updateRequest.appVersion);
  if (isMissingPatchVersion) {
    originalAppVersion = updateRequest.appVersion;
    const semverTagIndex = originalAppVersion.search(/[\+\-]/);
    if (semverTagIndex === -1) {
      updateRequest.appVersion += ".0";
    } else {
      updateRequest.appVersion = originalAppVersion.slice(0, semverTagIndex) + ".0" + originalAppVersion.slice(semverTagIndex);
    }
  }

  if (validationUtils.isValidUpdateCheckRequest(updateRequest)) {
    return storage.getPackageHistoryFromDeploymentKey(updateRequest.deploymentKey).then((packageHistory: storageTypes.Package[]) => {
      const updateObject: UpdateCheckCacheResponse = acquisitionUtils.getUpdatePackageInfo(packageHistory, updateRequest);
      console.log(updateObject,'updateObject')
      if ((isMissingPatchVersion || isPlainIntegerNumber) && updateObject.originalPackage.appVersion === updateRequest.appVersion) {
        // Set the appVersion of the response to the original one with the missing patch version or plain number
        updateObject.originalPackage.appVersion = originalAppVersion;
        if (updateObject.rolloutPackage) {
          updateObject.rolloutPackage.appVersion = originalAppVersion;
        }
      }

      const cacheableResponse: redis.CacheableResponse = {
        statusCode: 200,
        body: updateObject,
      };

      return q(cacheableResponse);
    });
  } else {
    if (!validationUtils.isValidKeyField(updateRequest.deploymentKey)) {
      errorUtils.sendMalformedRequestError(
        res,
        "An update check must include a valid deployment key - please check that your app has been " +
          "configured correctly. To view available deployment keys, run 'code-push-standalone deployment ls <appName> -k'."
      );
    } else if (!validationUtils.isValidAppVersionField(updateRequest.appVersion)) {
      errorUtils.sendMalformedRequestError(
        res,
        "An update check must include a binary version that conforms to the semver standard (e.g. '1.0.0'). " +
          "The binary version is normally inferred from the App Store/Play Store version configured with your app."
      );
    } else {
      errorUtils.sendMalformedRequestError(
        res,
        "An update check must include a valid deployment key and provide a semver-compliant app version."
      );
    }

    return q<redis.CacheableResponse>(null);
  }
}

export function getHealthRouter(config: AcquisitionConfig): express.Router {
  const storage: storageTypes.Storage = config.storage;
  const redisManager: redis.RedisManager = config.redisManager;
  const router: express.Router = express.Router();

  router.get("/health", (req: express.Request, res: express.Response, next: (err?: any) => void): any => {
    storage
      .checkHealth()
      .then(() => {
        return redisManager.checkHealth();
      })
      .then(() => {
        res.status(200).send("Healthy");
      })
      .catch((error: Error) => errorUtils.sendUnknownError(res, error, next))
      .done();
  });

  return router;
}

export function getAcquisitionRouter(config: AcquisitionConfig): express.Router {
  const storage: storageTypes.Storage = config.storage;
  const redisManager: redis.RedisManager = config.redisManager;
  const router: express.Router = express.Router();

  const updateCheck = function (newApi: boolean) {
    return function (req: express.Request, res: express.Response, next: (err?: any) => void) {
      const deploymentKey: string = String(req.query.deploymentKey || req.query.deployment_key);
      const key: string = redis.Utilities.getDeploymentKeyHash(handleDeploymentKey(deploymentKey));
      const clientUniqueId: string = String(req.query.clientUniqueId || req.query.client_unique_id);
      const url: string = getUrlKey(req.originalUrl);
      let fromCache: boolean = true;
      let redisError: Error;
      redisManager
        .getCachedResponse(key, url)
        .catch((error: Error) => {
          // Store the redis error to be thrown after we send response.
          redisError = error;
          return q<redis.CacheableResponse>(null);
        })
        .then((cachedResponse: redis.CacheableResponse) => {
          fromCache = !!cachedResponse;
          return cachedResponse || createResponseUsingStorage(req, res, storage);
        })
        .then((response: redis.CacheableResponse) => {
          if (!response) {
            return q<void>(null);
          }

          let giveRolloutPackage: boolean = false;
          const cachedResponseObject = <UpdateCheckCacheResponse>response.body;
          if (cachedResponseObject.rolloutPackage && clientUniqueId) {
            const releaseSpecificString: string =
              cachedResponseObject.rolloutPackage.label || cachedResponseObject.rolloutPackage.packageHash;
            giveRolloutPackage = rolloutSelector.isSelectedForRollout(
              clientUniqueId,
              cachedResponseObject.rollout,
              releaseSpecificString
            );
          }

          const updateCheckBody: { updateInfo: UpdateCheckResponse } = {
            updateInfo: giveRolloutPackage ? cachedResponseObject.rolloutPackage : cachedResponseObject.originalPackage,
          };

          // Change in new API
          updateCheckBody.updateInfo.target_binary_range = updateCheckBody.updateInfo.appVersion;

          res.locals.fromCache = fromCache;
          res.status(response.statusCode).send(newApi ? utils.convertObjectToSnakeCase(updateCheckBody) : updateCheckBody);

          // Update REDIS cache after sending the response so that we don't block the request.
          if (!fromCache) {
            return redisManager.setCachedResponse(key, url, response);
          }
        })
        .then(() => {
          if (redisError) {
            throw redisError;
          }
        })
        .catch((error: storageTypes.StorageError) => errorUtils.restErrorHandler(res, error, next))
        .done();
    };
  };

  const reportStatusDeploy = function (req: express.Request, res: express.Response, next: (err?: any) => void) {
    const deploymentKey = req.body.deploymentKey || req.body.deployment_key;
    const appVersion = req.body.appVersion || req.body.app_version;
    const previousDeploymentKey = req.body.previousDeploymentKey || req.body.previous_deployment_key || deploymentKey;
    const previousLabelOrAppVersion = req.body.previousLabelOrAppVersion || req.body.previous_label_or_app_version;
    const clientUniqueId = req.body.clientUniqueId || req.body.client_unique_id;

    if (!deploymentKey || !appVersion) {
      return errorUtils.sendMalformedRequestError(res, "A deploy status report must contain a valid appVersion and deploymentKey.");
    } else if (req.body.label) {
      if (!req.body.status) {
        return errorUtils.sendMalformedRequestError(res, "A deploy status report for a labelled package must contain a valid status.");
      } else if (!redis.Utilities.isValidDeploymentStatus(req.body.status)) {
        return errorUtils.sendMalformedRequestError(res, "Invalid status: " + req.body.status);
      }
    }

    const sdkVersion: string = restHeaders.getSdkVersion(req);
    if (semver.valid(sdkVersion) && semver.gte(sdkVersion, METRICS_BREAKING_VERSION)) {
      // If previousDeploymentKey not provided, assume it is the same deployment key.
      let redisUpdatePromise: q.Promise<void>;

      if (req.body.label && req.body.status === redis.DEPLOYMENT_FAILED) {
        redisUpdatePromise = redisManager.incrementLabelStatusCount(deploymentKey, req.body.label, req.body.status);
      } else {
        const labelOrAppVersion: string = req.body.label || appVersion;
        redisUpdatePromise = redisManager.recordUpdate(
          deploymentKey,
          labelOrAppVersion,
          previousDeploymentKey,
          previousLabelOrAppVersion
        );
      }

      redisUpdatePromise
        .then(() => {
          res.sendStatus(200);
          if (clientUniqueId) {
            redisManager.removeDeploymentKeyClientActiveLabel(previousDeploymentKey, clientUniqueId);
          }
        })
        .catch((error: any) => errorUtils.sendUnknownError(res, error, next))
        .done();
    } else {
      if (!clientUniqueId) {
        return errorUtils.sendMalformedRequestError(
          res,
          "A deploy status report must contain a valid appVersion, clientUniqueId and deploymentKey."
        );
      }

      return redisManager
        .getCurrentActiveLabel(deploymentKey, clientUniqueId)
        .then((currentVersionLabel: string) => {
          if (req.body.label && req.body.label !== currentVersionLabel) {
            return redisManager.incrementLabelStatusCount(deploymentKey, req.body.label, req.body.status).then(() => {
              if (req.body.status === redis.DEPLOYMENT_SUCCEEDED) {
                return redisManager.updateActiveAppForClient(deploymentKey, clientUniqueId, req.body.label, currentVersionLabel);
              }
            });
          } else if (!req.body.label && appVersion !== currentVersionLabel) {
            return redisManager.updateActiveAppForClient(deploymentKey, clientUniqueId, appVersion, appVersion);
          }
        })
        .then(() => {
          res.sendStatus(200);
        })
        .catch((error: any) => errorUtils.sendUnknownError(res, error, next))
        .done();
    }
  };

  const reportStatusDownload = function (req: express.Request, res: express.Response, next: (err?: any) => void) {
    const deploymentKey = req.body.deploymentKey || req.body.deployment_key;
    if (!req.body || !deploymentKey || !req.body.label) {
      return errorUtils.sendMalformedRequestError(
        res,
        "A download status report must contain a valid deploymentKey and package label."
      );
    }
    return redisManager
      .incrementLabelStatusCount(deploymentKey, req.body.label, redis.DOWNLOADED)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((error: any) => errorUtils.sendUnknownError(res, error, next))
      .done();
  };

  router.get("/updateCheck", updateCheck(false));
  router.get("/v0.1/public/codepush/update_check", updateCheck(true));

  router.post("/reportStatus/deploy", reportStatusDeploy);
  router.post("/v0.1/public/codepush/report_status/deploy", reportStatusDeploy);

  router.post("/reportStatus/download", reportStatusDownload);
  router.post("/v0.1/public/codepush/report_status/download", reportStatusDownload);

  return router;
}