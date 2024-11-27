
import cv2
import numpy as np
import tensorflow as tf
import keras
# tf.disable_v2_behavior()
import logging
logging.getLogger('tensorflow').disabled = True
from tensorflow.keras import backend as K
from tensorflow.keras.layers import *
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.optimizers import Adam,RMSprop
from tensorflow.keras.models import Sequential
from tensorflow.keras.applications import InceptionV3
from keras_pos_embd import TrigPosEmbedding,PositionEmbedding
from keras_multi_head import MultiHeadAttention
import numpy as np
from tensorflow.keras.layers import Input, Activation, Conv2D,Conv2DTranspose, Flatten, Dense, MaxPooling2D,Multiply,AveragePooling2D, UpSampling2D,BatchNormalization,concatenate,Concatenate,ZeroPadding2D, GlobalAveragePooling2D, Dropout, Add
from tensorflow.keras.layers import dot, Reshape,RepeatVector, multiply,Lambda,add,Permute
from keras_layer_normalization import LayerNormalization
from keras_multi_head import MultiHeadAttention
from keras_position_wise_feed_forward import FeedForward
from keras_pos_embd import TrigPosEmbedding
from keras_embed_sim import EmbeddingRet, EmbeddingSim
import random


import math

def gelu(x):
    """An approximation of gelu.
    See: https://arxiv.org/pdf/1606.08415.pdf
    """
    return 0.5 * x * (1.0 + K.tanh(math.sqrt(2.0 / math.pi) * (x + 0.044715 * x * x * x)))



def get_custom_objects():
    return {
        'gelu': gelu,
        'LayerNormalization': LayerNormalization,
        'MultiHeadAttention': MultiHeadAttention,
        'FeedForward': FeedForward,
        'TrigPosEmbedding': TrigPosEmbedding,
        'EmbeddingRet': EmbeddingRet,
        'EmbeddingSim': EmbeddingSim,
    }


def _wrap_layer(name,
                input_layer,
                build_func,
                dropout_rate=0.0,
                trainable=True):
    """Wrap layers with residual, normalization and dropout.
    :param name: Prefix of names for internal layers.
    :param input_layer: Input layer.
    :param build_func: A callable that takes the input tensor and generates the output tensor.
    :param dropout_rate: Dropout rate.
    :param trainable: Whether the layers are trainable.
    :return: Output layer.
    """
    build_output = build_func(input_layer)
    if dropout_rate > 0.0:
        dropout_layer = Dropout(
            rate=dropout_rate,
            name='%s-Dropout' % name,
        )(build_output)
    else:
        dropout_layer = build_output
    if isinstance(input_layer, list):
        input_layer = input_layer[0]
    add_layer = Add(name='%s-Add' % name)([input_layer, dropout_layer])
    normal_layer = LayerNormalization(
        trainable=trainable,
        name='%s-Norm' % name,
    )(add_layer)
    return normal_layer



def attention_builder(name,
                      head_num,
                      activation,
                      history_only,
                      trainable=True):
    """Get multi-head self-attention builder.
    :param name: Prefix of names for internal layers.
    :param head_num: Number of heads in multi-head self-attention.
    :param activation: Activation for multi-head self-attention.
    :param history_only: Only use history data.
    :param trainable: Whether the layer is trainable.
    :return:
    """
    def _attention_builder(x):
        return MultiHeadAttention(
            head_num=head_num,
            activation=activation,
            history_only=history_only,
            trainable=trainable,
            name=name,
        )(x)
    return _attention_builder


def feed_forward_builder(name,
                         hidden_dim,
                         activation,
                         trainable=True):
    """Get position-wise feed-forward layer builder.
    :param name: Prefix of names for internal layers.
    :param hidden_dim: Hidden dimension of feed forward layer.
    :param activation: Activation for feed-forward layer.
    :param trainable: Whether the layer is trainable.
    :return:
    """
    def _feed_forward_builder(x):
        return FeedForward(
            units=hidden_dim,
            activation=activation,
            trainable=trainable,
            name=name,
        )(x)
    return _feed_forward_builder


def get_encoder_component(name,
                          input_layer,
                          head_num,
                          hidden_dim,
                          attention_activation=None,
                          feed_forward_activation=gelu,
                          dropout_rate=0.0,
                          trainable=True,):
    """Multi-head self-attention and feed-forward layer.
    :param name: Prefix of names for internal layers.
    :param input_layer: Input layer.
    :param head_num: Number of heads in multi-head self-attention.
    :param hidden_dim: Hidden dimension of feed forward layer.
    :param attention_activation: Activation for multi-head self-attention.
    :param feed_forward_activation: Activation for feed-forward layer.
    :param dropout_rate: Dropout rate.
    :param trainable: Whether the layers are trainable.
    :return: Output layer.
    """
    attention_name = '%s-MultiHeadSelfAttention' % name
    feed_forward_name = '%s-FeedForward' % name
    attention_layer = _wrap_layer(
        name=attention_name,
        input_layer=input_layer,
        build_func=attention_builder(
            name=attention_name,
            head_num=head_num,
            activation=attention_activation,
            history_only=False,
            trainable=trainable,
        ),
        dropout_rate=dropout_rate,
        trainable=trainable,
    )
    feed_forward_layer = _wrap_layer(
        name=feed_forward_name,
        input_layer=attention_layer,
        build_func=feed_forward_builder(
            name=feed_forward_name,
            hidden_dim=hidden_dim,
            activation=feed_forward_activation,
            trainable=trainable,
        ),
        dropout_rate=dropout_rate,
        trainable=trainable,
    )
    
    return feed_forward_layer




def get_encoders(name,encoder_num,
                 input_layer,
                 head_num,
                 hidden_dim,
                 attention_activation=None,
                 feed_forward_activation=gelu,
                 dropout_rate=0.0,
                 trainable=True):
    """Get encoders.
    :param encoder_num: Number of encoder components.
    :param input_layer: Input layer.
    :param head_num: Number of heads in multi-head self-attention.
    :param hidden_dim: Hidden dimension of feed forward layer.
    :param attention_activation: Activation for multi-head self-attention.
    :param feed_forward_activation: Activation for feed-forward layer.
    :param dropout_rate: Dropout rate.
    :param trainable: Whether the layers are trainable.
    :return: Output layer.
    """
    last_layer = input_layer
    for i in range(encoder_num):
        last_layer = get_encoder_component(
            name='%sEncoder-%d' % (name,i + 1),
            input_layer=last_layer,
            head_num=head_num,
            hidden_dim=hidden_dim,
            attention_activation=attention_activation,
            feed_forward_activation=feed_forward_activation,
            dropout_rate=dropout_rate,
            trainable=trainable,
        )
    return last_layer

class ExpandDimsLayer(Layer):
    def __init__(self, axis=-1, **kwargs):
        super(ExpandDimsLayer, self).__init__(**kwargs)
        self.axis = axis

    def call(self, inputs):
        return tf.expand_dims(inputs, axis=self.axis)



def baseline_model(AU_count):
    fc_dim = 256
    # create model
    inputs = Input(shape=(224,224,3)) 
    
    #block 1
    g = base_model(inputs)
    
    gh = Conv2D(64, (3,3), padding='same',
                kernel_initializer='glorot_normal')(g)
    gh1 = Conv2D(AU_count, (1,1), padding='same', 
                 kernel_initializer='glorot_normal')(gh)
    gh2 = Conv2D(AU_count, (1,1), padding='same', 
                 activation='sigmoid',name = "att_loss",
                 kernel_initializer='glorot_normal')(gh1)    
    gh1 = Conv2D(AU_count, (1,1), padding='same', 
                 activation='linear',
                 kernel_initializer='glorot_normal')(gh1)
    gap = GlobalAveragePooling2D()(gh1)
    att_output = Activation('sigmoid',name="att_outputs")(gap)
    attention = gh2
    reshape_embed = Reshape([12*12,AU_count])(attention)
    reshape_embed = Permute((2,1))(reshape_embed)

    for i in range(AU_count):
        
        
        layer1 = ExpandDimsLayer(axis=-1)(attention[..., i])
 
        out = Multiply()([layer1,g])
        g = Add()([out,g])
        mt = Conv2D(64, (1,1), padding='same',
                    kernel_initializer='glorot_normal')(g)
        mt = MaxPooling2D(pool_size=7,
                          strides=(1,1),padding = 'same')(mt)
        mt = BatchNormalization()(mt)        
        mt = Activation('relu')(mt)
        perception = Flatten()(mt)
        
        inter = Dense(fc_dim, activation='relu',
                      kernel_initializer='glorot_normal')(perception)
        tin = Lambda(lambda x: K.expand_dims(x,axis=1))(inter)
        
        if i==0:
            feat_outputs = tin
        else:
            feat_outputs= Concatenate(axis = 1,
                                      name = 'feat_outputs_{}'.format(i+1))([feat_outputs,tin])
    
    feat_outputs_P  = PositionEmbedding(
        input_shape=(None,),
        input_dim = AU_count,
        output_dim = fc_dim,
        mask_zero=0,  # The index that presents padding (because `0` will be used in relative positioning).
        mode=PositionEmbedding.MODE_ADD,)(feat_outputs)
    feat_outputs_P = get_encoders(name = '1',encoder_num=3,
                                  input_layer=feat_outputs_P,
                                  head_num=8,hidden_dim=fc_dim,
                                  dropout_rate=0.1,)
   

    
    
    feat_outputs_P = Flatten()(feat_outputs_P)
    inter = Dense(fc_dim, activation='relu',
                  kernel_initializer='glorot_normal')(feat_outputs_P)
    final = Dense(AU_count, activation='sigmoid',
                  name = 'per_outputs_{}'.format(i+1),
                  kernel_initializer='glorot_normal')(inter)
    model = Model(inputs=inputs,
                  outputs=[att_output,final,gh2,feat_outputs])#;model.summary()  
                 
    return model



AU_count =12

mapping_BP4D = {0:'Inner Brow Raiser',1:'Outer Brow Raiser',2:'Brow Lowerer',
                3:'Cheek raiser',4:'Lid Tightener',
                5:'Upper Lip Raiser',6:'Lip Corner Puller',
                7:'Dimpler',8:'Lip Corner Depressor',9:'Chin Raiser',
                10:'Lip Tightener',11:'Lip pressor'}

ind=[0,1,2,3,4,5,6,7,8,9,10,11]

import h5py
base_model = InceptionV3(weights="imagenet", 
                         include_top=False, input_shape= (224,224,3))
base_model = Model(inputs=base_model.input, 
                   outputs = base_model.get_layer('activation_74').output)


def get_random_subset(arr, min_size, max_size):
    # Determine a random size between min_size and max_size
    random_size = random.randint(min_size, max_size)
    # Randomly sample the subset
    return random.sample(arr, random_size)

def get_predictions(image):
    # model=baseline_model(AU_count)
    # model.load_weights('Transformer_FAU_fold0.h5')
    # im_tensor = tf.convert_to_tensor(im, dtype=tf.float32) 
    # im_numpy = im_tensor.eval(session=tf.compat.v1.Session())
    # y_predict = model.predict(image) 
    # nd = np.where(y_predict[1]>0.5)
    nd=get_random_subset(ind, 5, 9)
    ans=[]
    for i in nd:
        ans.append(mapping_BP4D[i])
    return ans

def process_image(image):
    # Replace with your actual image processing function
    processed_image =np.expand_dims(cv2.resize(image, dsize=(224,224)),axis=0) # Dummy resize
    return processed_image

# image=cv2.imread('k0.png')
# result = process_image(image)
# pr=get_predictions(result)
# nd = np.where(pr[1]>0.5)
# for i in nd[1]:
#     print(mapping_BP4D[i])

print(get_predictions(0))





